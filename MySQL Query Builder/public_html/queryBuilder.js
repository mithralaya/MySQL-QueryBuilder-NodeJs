/*
 * 
 * @Author                  Karthik Vasudevan
 * @AuthorEmail             mithralaya@gmail.com
 * @Licence                 Free to download and modify for both commercial and individuals 
 * @FileName                queryBuilder.js
 * @Purpose                 To build simple select, insert & update queries for mysql. 
 * @Dependencies            util
 * @ConstructorParam        (string) tableName, (array) fields, (object) where, (array) groupBy, (array) orderBy, (int) limit, (int) offset
 * 
 * 
 * Input format for WHERE
 * 
 * this._where = {  // Objects based where condition. more advanced with both AND and OR statements
 *      "<fieldName>": {
 *          "value": {string}, {int}, {float}, {null}, {array}, {object}
 *          "condition": {=}, {>=}, {<=}, {IN}, {NOT IN}, {IS}, {IS NOT}
 *      }
 * }
 * 
 * Input format for SELECT
 * 
 * this._tableName = {string} // the table name you wanted to use for select, input or update
 * 
 * this._fields = ['<fieldName1>', '<fieldName2>'] // the fields you wanted to select from a table or view.
 * 
 * 
 * 
 * this._groupBy = ['<fieldName1>', '<fieldName2>']
 * 
 * this._orderBy = ['<fieldName1> ASC', '<fieldName2> DESC']
 * 
 * this._limit = int
 * 
 * this.offset = int
 * 
 * 
 * Input Object for INSERT
 * 
 * Multiple inserts are alowed 
 * Objects with identifiers will automatically update records
 * var object = {
 *      "0": {
 *          "<field1>": "<value>",
 *          "<field2>": "<value>",
 *          "<field3>": "<value>"
 *      },
 *      "1": {
 *          "<field1>": "<value>",
 *          "<field2>": "<value>",
 *          "<field3>": "<value>"
 *      }
 * }
 * 
 * 
 * Input Object for UPDATE
 * 
 * var object = {
 *      "<field1">": "<value>",
 *      "<field2">": "<value>",
 *      "<field3">": "<value>"
 * }
 *   
 */


var util = require('util');

//Constructor function
var QueryBuilder = function(tableName, fields, where, groupBy, orderBy, limit, offset) {
    
    //Private variables
    
    
    //Public variables
    this._tableName = tableName;
    this._fields = (util.isArray(fields))? fields: [];
    this._where = where;
    this._orderBy = (util.isArray(orderBy))? orderBy: [];
    this._groupBy = (util.isArray(groupBy))? groupBy: [];
    this._limit = parseInt(limit);
    this._offset = parseInt(offset);
};


//Prototypes
QueryBuilder.prototype = {
    
    /*
     * 
     * @name        buildWhere
     * @param       none
     * @throws      none
     * @returns     (string) whereString
     * 
     * Builds where statement using the given where object.
     * 
     */
    buildWhere: function() 
    {
        var whereString = '';
        for(var whereKey in this._where){
            if(this._where.hasOwnProperty(whereKey)){
                //if it is a object wrap OR statement
                if(typeof this._where[whereKey].value === 'object' 
                   && this._where[whereKey].value != null 
                   && this._where[whereKey].value instanceof Array === false) 
                {
                    //if value is an object do OR statement
                    whereString += '(';
                    for(var valueKey in this._where[whereKey].value)
                    {
                        if(this._where[whereKey].value.hasOwnProperty(valueKey))
                        {
                            if(this._where[whereKey].value[valueKey].value instanceof Array)
                            {                    
                                //if value is string simply wrap with condition
                                var isValueNull = ' ("'+this._where[whereKey].value[valueKey].value.join('","')+'")';
                                whereString += '(`'+valueKey+'` '+this._where[whereKey].value[valueKey].condition+ isValueNull+') OR ';
                            }
                            else
                            {
                                var isValueNull = (this._where[whereKey].value[valueKey].value == null)? ' NULL' : ' "'+this._where[whereKey].value[valueKey].value+'"';
                                whereString += '(`'+valueKey+'` '+this._where[whereKey].value[valueKey].condition+ isValueNull + ') OR '
                            }
                        }
                    }
                    whereString = whereString.slice(0, whereString.length-4)+')';
                }
                //if it is an array prepare for IN statement
                else if(this._where[whereKey].value instanceof Array)
                {                    
                    //if value is string simply wrap with condition
                    var isValueNull = ' ("'+this._where[whereKey].value.join('","')+'")';
                    whereString += '(`'+whereKey+'` '+this._where[whereKey].condition+ isValueNull+')';
                }
                else
                {
                    //if value is string simply wrap with condition
                    var isValueNull = (this._where[whereKey].value == null)? ' NULL' : ' "'+this._where[whereKey].value+'"';
                    whereString += '(`'+whereKey+'` '+this._where[whereKey].condition+ isValueNull+')';
                }
                whereString += ' AND ';
            }
        }
        whereString = whereString.slice(0, whereString.length-4);
        return whereString;
    },
            
    /*
     * 
     * @name        buildSelect
     * @param       (bool) size, (bool) oneRecord
     * @throws      none
     * @returns     (string) selectStmt
     * @see         Check mysql documentation
     * @todo:       Code review and make it simpler. Its too complex with lot of if statements
     * 
     * Builds select statement using given parameters like where, fields, orderby etc.
     * 
     */
    buildSelect: function(size, oneRecord)
    {
        this._selectStmt = 'SELECT ';
        
        
        //check if the query is to get total no of records
        if(size)
        {
            this._selectStmt += 'COUNT(*) AS `TotalRows`';
        }
        //check if fields param is set as array and its not empty
        else if(this._fields.length > 0)
        {
            this._selectStmt += this._fields.join(',');
        }        
        //otherwise select all fields
        else
        {
            this._selectStmt += '*';
        }
        
        //set the tablename
        this._selectStmt += ' FROM '+this._tableName;
        
        //check if where is set as an object and its not undefined
        if(this._where !== undefined)
        {
            this._selectStmt += ' WHERE '+this.buildWhere();
        }
        //check if groupBy is set as an array and its not empty
        if(this._groupBy.length > 0)
        {
            this._selectStmt += ' GROUP BY '+this._groupBy.join(",");
        }
        
        //check if orderBy is set as an array and its not empty
        if(this._orderBy.length > 0)
        {
            this._selectStmt += ' ORDER BY '+this._orderBy.join(",");
        }
        
        //check if limit is set
        if(!size && !oneRecord)
        {
            if(this._limit >= 0)
            {
                this._selectStmt += ' LIMIT '+this._limit;
                if(this._offset >= 0)
                {
                    this._selectStmt +=', '+this._offset;
                }
            }
        }
        //check if the request is for one record
        if(oneRecord)
        {
            this._selectStmt += ' LIMIT 1';
        }
        return this._selectStmt;
    },
            
    /*
     * 
     * @name        buildInsert
     * @param       (object) object
     * @throws      none
     * @returns     (string) insertStmt
     * @see         check mysql documentation
     * @todo:       Needs code review and make it simpler. 3 loops and lot of if confditions. 3 loops inside a loop.
     * 
     * Builds the Insert or Update mysql statement with the give object and set params.
     * 
     */   
    buildInsert: function(object)
    {
        
        if(object === undefined)
        {
            new Error('input must contain an object');
        }
        
        //build insert
        this._insertStmt = 'INSERT INTO `'+ this._tableName+'` (';
        
        //loop through each object to get its object keys to build field names
        for(var objectKey in object)
        {
            if(object.hasOwnProperty(objectKey))
            {                
                for(var key in object[objectKey])
                {
                    if(object[objectKey].hasOwnProperty(key))
                    {
                        //create fields in comma seprated
                        this._insertStmt += key+', ';                  
                    }
                }
                break;
            }
        }
        
        //slice up the additional characters
        this._insertStmt = this._insertStmt.slice(0, this._insertStmt.length-2);        
        this._insertStmt += ') VALUES '; 
        
        //create values set
        for(var objectKey in object)
        {
            if(object.hasOwnProperty(objectKey))
            {                
                //Creating bulk insert option if the object has more than one row
                this._insertStmt += '('
                for(var key in object[objectKey])
                {
                    if(object[objectKey].hasOwnProperty(key))
                    {
                        this._insertStmt += (object[objectKey][key] == null)? 'NULL, ':  '"'+object[objectKey][key]+'", '; 
                    }
                }
                this._insertStmt = this._insertStmt.slice(0, this._insertStmt.length-2);
                this._insertStmt += '), ';
            }
        }
        
        this._insertStmt = this._insertStmt.slice(0, this._insertStmt.length-2);
        
        // Building on duplicate key 
        this._insertStmt += ' ON DUPLICATE KEY UPDATE ';
        
        for(var objectKey in object)
        {
            if(object.hasOwnProperty(objectKey))
            {                
                for(var key in object[objectKey])
                {
                    if(object[objectKey].hasOwnProperty(key))
                    {
                        // set key value par for the on duplicate key update
                        this._insertStmt += '`'+key+'` = VALUES('+key+'), ';
                    }
                }
                break;
            }
        }
        // slice up the additional characters
        this._insertStmt = this._insertStmt.slice(0, this._insertStmt.length-2);
        
        return this._insertStmt;
    },
    
    /*
     * 
     * @name        buildUpdate
     * @param       (object) object
     * @throws      none
     * @returns     (string) updateStmt
     * @see         see mysql documentation 
     * 
     * Builds the update statement using the given params.
     * 
     */
    buildUpdate: function(object)
    {
        if(object === undefined)
        {
            new Error('input must contain an object');
        }
        this._updateStmt = 'UPDATE `'+this._tableName;
        this._updateStmt += '` SET ';
        
        //loop through key value pair to build set command
        for(var key in object){
            if(object.hasOwnProperty(key)){
                var checkIfNull = (object[key] == null)? 'NULL': '"'+object[key]+'"';
                this._updateStmt += '`'+key+'` = '+checkIfNull+', ';
            }
        }
        
        this._updateStmt = this._updateStmt.slice(0, this._updateStmt.length-2);
        
        //check if where is set as an object and its not undefined
        if(this._where !== undefined)
        {
            //build where statement
            this._updateStmt += ' WHERE '+this.buildWhere();
        }
        
        return this._updateStmt;
    }
};


exports.QueryBuilder = QueryBuilder;
