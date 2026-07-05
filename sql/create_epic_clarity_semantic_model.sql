/*
    Epic Clarity Semantic Model Metadata Builder
    ------------------------------------------------------------
    Purpose:
      Builds dbo.semantic_model from SQL Server catalog metadata plus
      Epic Clarity data-dictionary metadata.

    Intended use:
      Feed this table, or an export from this table, into an agentic AI / RAG
      layer so natural-language questions can be grounded in real Clarity
      tables, columns, descriptions, data types, deprecation flags, and
      available SQL Server foreign-key relationships.

    Assumptions:
      - The Clarity reporting tables live in schema dbo.
      - Epic data-dictionary tables are available in database CLARITY:
          CLARITY..CLARITY_TBL
          CLARITY..CLARITY_COL
          CLARITY..CLARITY_COL_INIITM
      - This script is run from the database where dbo.semantic_model should be created.

    Notes:
      - Epic Clarity does not always expose every logical relationship as a SQL
        Server foreign key. This script captures physical FKs where present and
        Epic's own table/column metadata where available.
      - CLARITY_COL_INIITM can have multiple lines per column. This script keeps
        LINE = 1 as the primary INI/item mapping, matching the source query Jeff provided.
*/

SET NOCOUNT ON;
GO

-----------------------------------------------------------------------
-- 1) Drop the target table if it already exists
-----------------------------------------------------------------------
IF OBJECT_ID('dbo.semantic_model', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.semantic_model;
END;
GO

-----------------------------------------------------------------------
-- 2) Create dbo.semantic_model with SQL Server catalog metadata,
--    physical relationship metadata, and Epic Clarity dictionary metadata
-----------------------------------------------------------------------
SELECT
    -------------------------------------------------------------------
    -- SQL Server catalog metadata
    -------------------------------------------------------------------
    sch.name                                                AS SchemaName,
    t.name                                                  AS TableName,
    c.name                                                  AS ColumnName,
    c.column_id                                             AS SqlColumnID,
    ty.name                                                 AS SqlDataType,
    c.max_length                                            AS SqlMaxLength,
    c.precision                                             AS SqlPrecision,
    c.scale                                                 AS SqlScale,
    c.is_nullable                                           AS SqlIsNullable,
    c.is_identity                                           AS SqlIsIdentity,
    c.is_computed                                           AS SqlIsComputed,
    CAST(ep_col.value AS NVARCHAR(MAX))                     AS SqlColumnDescription,
    CAST(ep_tbl.value AS NVARCHAR(MAX))                     AS SqlTableDescription,

    -------------------------------------------------------------------
    -- SQL Server physical foreign-key metadata, where present
    -------------------------------------------------------------------
    fk.FK_Name                                              AS ForeignKeyName,
    rs.name                                                 AS ReferencedSchemaName,
    rt.name                                                 AS ReferencedTableName,
    rc.name                                                 AS ReferencedColumnName,

    -------------------------------------------------------------------
    -- Epic Clarity table metadata
    -------------------------------------------------------------------
    ctbl.TABLE_ID                                           AS ClarityTableID,
    ctbl.TABLE_NAME                                         AS ClarityTableName,
    ctbl.DEPRECATED_YN                                      AS TableDeprecatedYN,
    ctbl.IS_EXTRACTED_YN                                    AS IsExtractedYN,

    -------------------------------------------------------------------
    -- Epic Clarity column metadata
    -------------------------------------------------------------------
    cc.COLUMN_ID                                            AS ClarityColumnID,
    cc.COLUMN_NAME                                          AS ClarityColumnName,
    cci.COLUMN_INI                                          AS ColumnINI,
    cci.COLUMN_ITEM                                         AS ColumnItem,
    cc.DATA_TYPE                                            AS ClarityDataType,
    cc.CLARITY_PRECISION                                    AS ClarityPrecision,
    cc.DISCONTINUED_ITEM_YN                                 AS DiscontinuedItemYN,
    cc.HOUR_FORMAT                                          AS HourFormat,
    cc.DESCRIPTION                                          AS ClarityColumnDescription,
    cc.DEPRECATED_YN                                        AS ColumnDeprecatedYN,

    -------------------------------------------------------------------
    -- AI/RAG convenience fields
    -------------------------------------------------------------------
    CAST(
        CASE
            WHEN ctbl.DEPRECATED_YN = 'Y'
                 OR cc.DEPRECATED_YN = 'Y'
                 OR cc.DISCONTINUED_ITEM_YN = 'Y'
            THEN 0
            ELSE 1
        END AS BIT
    )                                                       AS IsRecommendedForAgentUse,

    CONCAT(
        'schema=', sch.name,
        '; table=', t.name,
        '; column=', c.name,
        '; sql_type=', ty.name,
        '; clarity_type=', COALESCE(cc.DATA_TYPE, ''),
        '; clarity_precision=', COALESCE(CONVERT(VARCHAR(50), cc.CLARITY_PRECISION), ''),
        '; column_ini=', COALESCE(CONVERT(VARCHAR(100), cci.COLUMN_INI), ''),
        '; column_item=', COALESCE(CONVERT(VARCHAR(100), cci.COLUMN_ITEM), ''),
        '; sql_description=', COALESCE(CAST(ep_col.value AS NVARCHAR(MAX)), ''),
        '; clarity_description=', COALESCE(CAST(cc.DESCRIPTION AS NVARCHAR(MAX)), ''),
        '; referenced_table=', COALESCE(rt.name, ''),
        '; referenced_column=', COALESCE(rc.name, ''),
        '; table_deprecated=', COALESCE(ctbl.DEPRECATED_YN, ''),
        '; column_deprecated=', COALESCE(cc.DEPRECATED_YN, ''),
        '; discontinued=', COALESCE(cc.DISCONTINUED_ITEM_YN, ''),
        '; extracted=', COALESCE(ctbl.IS_EXTRACTED_YN, '')
    )                                                       AS AgentSemanticText

INTO dbo.semantic_model
FROM sys.schemas AS sch
JOIN sys.tables AS t
    ON t.schema_id = sch.schema_id
JOIN sys.columns AS c
    ON c.object_id = t.object_id
JOIN sys.types AS ty
    ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.extended_properties AS ep_col
    ON ep_col.class_desc = 'OBJECT_OR_COLUMN'
   AND ep_col.major_id = c.object_id
   AND ep_col.minor_id = c.column_id
   AND ep_col.name = 'MS_Description'
LEFT JOIN sys.extended_properties AS ep_tbl
    ON ep_tbl.class_desc = 'OBJECT_OR_COLUMN'
   AND ep_tbl.major_id = t.object_id
   AND ep_tbl.minor_id = 0
   AND ep_tbl.name = 'MS_Description'
LEFT JOIN (
    SELECT
        fk.object_id                 AS FK_ObjectID,
        fk.name                      AS FK_Name,
        fkc.parent_object_id,
        fkc.parent_column_id,
        fkc.referenced_object_id,
        fkc.referenced_column_id
    FROM sys.foreign_keys AS fk
    JOIN sys.foreign_key_columns AS fkc
        ON fkc.constraint_object_id = fk.object_id
) AS fk
    ON fk.parent_object_id = c.object_id
   AND fk.parent_column_id = c.column_id
LEFT JOIN sys.tables AS rt
    ON rt.object_id = fk.referenced_object_id
LEFT JOIN sys.schemas AS rs
    ON rs.schema_id = rt.schema_id
LEFT JOIN sys.columns AS rc
    ON rc.object_id = fk.referenced_object_id
   AND rc.column_id = fk.referenced_column_id

-----------------------------------------------------------------------
-- Epic Clarity data dictionary
-----------------------------------------------------------------------
LEFT JOIN CLARITY..CLARITY_TBL AS ctbl
    ON ctbl.TABLE_NAME = t.name
LEFT JOIN CLARITY..CLARITY_COL AS cc
    ON cc.TABLE_ID = ctbl.TABLE_ID
   AND cc.COLUMN_NAME = c.name
LEFT JOIN CLARITY..CLARITY_COL_INIITM AS cci
    ON cci.COLUMN_ID = cc.COLUMN_ID
   AND cci.[LINE] = 1

WHERE sch.name = 'dbo'
ORDER BY
    sch.name,
    t.name,
    c.column_id;
GO

-----------------------------------------------------------------------
-- 3) Add indexes for lookup, export, and agent retrieval patterns
-----------------------------------------------------------------------
CREATE CLUSTERED INDEX CX_semantic_model
    ON dbo.semantic_model(SchemaName, TableName, SqlColumnID, ColumnName);
GO

CREATE NONCLUSTERED INDEX IX_semantic_model_table_column
    ON dbo.semantic_model(TableName, ColumnName)
    INCLUDE (
        ClarityColumnDescription,
        SqlColumnDescription,
        ClarityDataType,
        ForeignKeyName,
        ReferencedTableName,
        ReferencedColumnName,
        IsRecommendedForAgentUse
    );
GO

CREATE NONCLUSTERED INDEX IX_semantic_model_clarity_dictionary
    ON dbo.semantic_model(ClarityTableName, ClarityColumnName, ClarityColumnID)
    INCLUDE (
        ColumnINI,
        ColumnItem,
        ClarityColumnDescription,
        TableDeprecatedYN,
        ColumnDeprecatedYN,
        DiscontinuedItemYN,
        IsExtractedYN
    );
GO

-----------------------------------------------------------------------
-- 4) Optional validation / quick review
-----------------------------------------------------------------------
SELECT
    COUNT(*) AS SemanticModelRows,
    COUNT(DISTINCT TableName) AS TableCount,
    SUM(CASE WHEN ClarityColumnID IS NOT NULL THEN 1 ELSE 0 END) AS RowsMatchedToClarityDictionary,
    SUM(CASE WHEN IsRecommendedForAgentUse = 1 THEN 1 ELSE 0 END) AS RowsRecommendedForAgentUse
FROM dbo.semantic_model;
GO

SELECT TOP (100)
    SchemaName,
    TableName,
    ColumnName,
    ClarityColumnDescription,
    ColumnINI,
    ColumnItem,
    ClarityDataType,
    ForeignKeyName,
    ReferencedTableName,
    ReferencedColumnName,
    IsRecommendedForAgentUse
FROM dbo.semantic_model
ORDER BY TableName, SqlColumnID;
GO
