import json
import pandas as pd
import json


reviews = '../data/Video_Games.jsonl'
reviews_data = []
with open(reviews, 'r') as fp:
    i = 0
    for line in fp:
        reviews_data.append(json.loads(line.strip()))
        print('loading', i)
        i += 1


meta = '../data/meta_Video_Games.jsonl'
meta_data = []
with open(meta, 'r') as fp:
    i = 0
    for line in fp:
        meta_data.append(json.loads(line.strip()))
        print('loading', i)
        i += 1

reviews_df = pd.DataFrame(data=reviews_data)
meta_df = pd.DataFrame(data=meta_data)

print('\n\nBelow is the preview for reviews')
print(reviews_df.head())
print('\n\nBelow is the preview for metadata')
print(meta_df.head())

meta_df.to_csv('../data/amazon_meta.csv', index=True)
reviews_df.to_csv('../data/amazon_reviews.csv', index=True)
