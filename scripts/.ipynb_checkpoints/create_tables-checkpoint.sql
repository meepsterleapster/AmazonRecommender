CREATE TABLE amazon_products (
    id integer PRIMARY KEY,
    main_category VARCHAR(255),
    title TEXT,
    average_rating FLOAT,
    rating_number INT,
    features text,
    description text,
    price float,
    images text,
    videos text,
    store VARCHAR(255),
    categories text,
    details text, 
    parent_asin VARCHAR(50),
    bought_together VARCHAR(255),
    subtitle VARCHAR(50),
    author varchar(50)
);

CREATE TABLE product_reviews (
    id integer PRIMARY KEY,
    rating int,
    title varchar(255), 
    text text, 
    images text, 
    asin VARCHAR(50),
    parent_asin VARCHAR(50),
    user_id VARCHAR(100),
    timestamp int,
    helpful_vote int,
    verified_purchase BOOL
);

