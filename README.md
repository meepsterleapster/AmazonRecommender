# AmazonRecommender

Download data at `https://amazon-reviews-2023.github.io/`

# Initial database setup

Next to /scripts, there should also be a /data folder. Put __meta_Video_Games.jsonl__ and __Video_Games.jsonl__ into the data folder. Do nothing else. Then follow the steps below.

1. In the scripts dir > ``python3 extract.py``
2. In the data dir > ``sqlite3 amazon.db``
3. In sqlite > ``.read ../scripts/create_tables.sql``
4. In sqlite > ``.read ../scripts/import_tables.sql``

> There should be no errors and no response to terminal for anything except extract.py. 
You can test the sqlite db with:

```sql
select count(*) 
from amazon_products;
-- 137269
```

```sql
select count(*) 
from product_reviews;
--4624615
```

Also, set the output to pretty-print the table with:
``.mode columns`` and ``.headers on``

Then figure out the rest of whatever formatting you want on your own.
