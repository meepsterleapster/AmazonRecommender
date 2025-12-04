# imports
import pandas as pd
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import seaborn as sns
import matplotlib.pyplot as plt

import re, ast
from scipy.sparse import csr_matrix, hstack, vstack, issparse

from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer, HashingVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA

df = pd.read_csv("../data/prep.csv")
print(f" Loaded! Shape: {df.shape}")
print(f" Columns: {df.columns.tolist()}")
print(f" Unique books: {df['parent_asin'].nunique():,}")
print(f" Unique users: {df['user_id'].nunique():,}")


def extract_unique_items(df):

    print("Extracting unique items and building metadata table...\n")

    # Validate required columns
    required_columns = ["parent_asin", "price", "rating", "merged_text"]
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Aggregate at the item level
    item_df = (
        df.groupby("parent_asin").agg(
            price=("price", "first"),
            avg_rating=("rating", "mean"),
            num_ratings=("rating", "count"),
            text=("merged_text", "first"),
        )
    ).reset_index()

    item_df.head()

    # Display summary and preview
    print(f"Extracted {item_df.shape[0]:,} unique items.")
    print("Preview of item metadata:")
    print(item_df.head())

    return item_df


def build_item_representation(df, max_features=10000, min_df=2, ngram_range=(1, 2)):

    print("Building hybrid item representations (text + numeric)...\n")

    # TF-IDF vectorization for textual metadata
    tfidf = TfidfVectorizer(
        max_features=max_features,
        min_df=min_df,
        ngram_range=ngram_range,
        stop_words="english",
    )
    tfidf_matrix = tfidf.fit_transform(df["text"])

    # Select and normalize numeric features
    numeric_features = ["price", "avg_rating", "num_ratings"]
    scaler = StandardScaler()

    # Convert to numeric safely
    numeric_data = df[numeric_features].apply(pd.to_numeric, errors="coerce").fillna(0)
    numeric_scaled = scaler.fit_transform(numeric_data)
    print(f"Numeric features scaled (columns: {numeric_features})")

    # Convert to sparse format for concatenation
    numeric_sparse = np.nan_to_num(numeric_scaled)

    # Concatenate text and numeric representations
    hybrid_matrix = hstack([tfidf_matrix, numeric_sparse]).tocsr()
    print(f"Final hybrid matrix shape: {hybrid_matrix.shape}")

    # Maintain item lookup for interpretation
    tfidf_index = df["parent_asin"].reset_index(drop=True)
    print("Created lookup table linking vectors to item parent_asin.\n")
    print(tfidf_index.head())

    return hybrid_matrix, tfidf, tfidf_index


def return_recommended_items(
    user_reviews, tfidf_index, hybrid_matrix, top_k=10, top_n=10
):
    # two dictionaries: one to store weighted scores, and a total similairty sum, so I can normalize later
    # both are keyed by item_index : val
    scores = {}
    sim_sums = {}
    user_reviews = user_reviews.to_dict(orient="records")
    # For each review the user has given:
    for review in user_reviews:
        parent_asin = review["parent_asin"]
        rating = review["rating"]

        # Double check validity
        if parent_asin in tfidf_index.values:

            # Get the row index of the item in the hybird matrix, then compute cosine similarity
            row_idx = tfidf_index[tfidf_index == parent_asin].index[0]
            sims = cosine_similarity(hybrid_matrix[row_idx], hybrid_matrix)[0]

            # Top_k determines how many similar items to consider for each item the user has rated
            # runtime gets longer for higher k vals, we can disscuss val later
            k = top_k

            # Get the indices of the top k similar items
            top_k_idx = np.argpartition(sims, -k)[-k:]
            top_k_idx = top_k_idx[np.argsort(sims[top_k_idx])[::-1]]
            top_k_sims = sims[top_k_idx]

            # calculate those similarity scores
            # formula I use is user rating of current item * similarity score
            for neighbor_idx, sim_val in zip(top_k_idx, top_k_sims):

                # Exclude self-similarity
                if neighbor_idx == row_idx:
                    continue
                weight = rating * sim_val
                scores[neighbor_idx] = scores.get(neighbor_idx, 0) + weight
                sim_sums[neighbor_idx] = sim_sums.get(neighbor_idx, 0) + abs(sim_val)

    # sort our scores, and also normalize.
    # This normalzation order was given to me by ChatGPT, we can disscuss validly later.
    ranked_scores = {idx: score / sim_sums[idx] for idx, score in scores.items()}
    ranked_items = sorted(ranked_scores.items(), key=lambda x: x[1], reverse=True)

    # Now, just return the top_n items, excluding any the user has already reviewed
    recommended_items = []
    amount_to_return = top_n
    for idx, score in ranked_items[:top_n]:
        if tfidf_index[idx] not in [review["parent_asin"] for review in user_reviews]:
            recommended_items.append((tfidf_index[idx], float(score)))
        else:
            amount_to_return += 1

    return recommended_items


item_df = extract_unique_items(df)
hybrid_matrix, tfidf, tfidf_index = build_item_representation(item_df)


def get_recommendations(user_ratings):
    print("user ratings:", user_ratings)
    recommendations = return_recommended_items(
        user_reviews=user_ratings,
        tfidf_index=tfidf_index,
        hybrid_matrix=hybrid_matrix,
        top_k=10,
        top_n=10,
    )
    return recommendations
