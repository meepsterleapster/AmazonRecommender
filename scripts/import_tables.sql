.mode csv
-- .import --skip 1 amazon_meta-test.csv amazon_products
-- .import --skip 1 amazon_reviews-test.csv product_reviews
.import --skip 1 amazon_meta.csv amazon_products
.import --skip 1 amazon_reviews.csv product_reviews
