MySQL-QueryBuilder-NodeJs
=========================

A single class to build simple mysql queries like SELECT, INSERT &amp; UPDATE.

The class is in MySQL Query Builder/public_html/queryBuilder.js

I considered that the user of this class will use MySQL Views for reusable JOIN function, for that reason the JOINS are not available in the class.



Examples
========
```
  var QueryBuilder = require('queryBuilder');

  var query = new QueryBuilder();
  query._tableName = "UserView";
  query._fieldName = ["firstName", "lastName", "timeJoined"];
  query._where = {
      "object": {
          "email": {
              "value": "something@something.com",
              "condition": "="
          },
          "username": {
              "value": ["something", "some", "thing"],
              "condition": "IN"
          }        
      },
      "activate": {
        "value": null,
        "condition": "IS NOT"
      },
      "password": {
        "value": "wewrw3423kwe33k53lk232lk234k2234il32",
        "condition": "="
      }  
  }
  query._groupBy = ["id", "name"];
  query._orderBy = ["timeJoined DESC", "id ASC"];
  
  query._limit = 0;
  query._offset = 10;
  
  var selectStatement = query.buildSelect();
```

The above variable selectStatement will have a SELECT query like:

```
SELECT `firstName`, `lastName`, `timeJoined` FROM UserView
WHERE ((`email` = "something@something.com") OR (`username` IN ("something", "some", "thing"))) 
AND (`activate` IS NOT NULL)
AND (`password` = "wewrw3423kwe33k53lk232lk234k2234il32")
GROUP BY `id`, `name`
ORDER BY `timeJoined` DESC, `id` ASC
LIMIT 0, 10

```

If you think the above method is too long you can do something like:

```
var query = new QueryBuilder("UserView"
                              , ["firstName", "lastName", "timeJoined"]
                              , {
                                    "object": {
                                        "email": {
                                            "value": "something@something.com",
                                            "condition": "="
                                        },
                                        "username": {
                                            "value": ["something", "some", "thing"],
                                            "condition": "IN"
                                        }        
                                    },
                                    "activate": {
                                      "value": null,
                                      "condition": "IS NOT"
                                    },
                                    "password": {
                                      "value": "wewrw3423kwe33k53lk232lk234k2234il32",
                                      "condition": "="
                                    }  
                                }
                             , ["id", "name"]
                             , ["timeJoined DESC", "id ASC"]
                             , 0, 10);
                             
var selectStatement = query.buildSelect();
```

I thought it would be helpful for someone out there. please leave your comments. 
