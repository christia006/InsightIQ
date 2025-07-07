from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import json
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app) # Mengizinkan Cross-Origin Resource Sharing (penting untuk frontend)

# Konfigurasi Basis Data
DB_CONFIG = {
    "dbname": "neurosordb",
    "user": "neurosord_user",
    "password": "Sayabag",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    """Membangun koneksi ke database PostgreSQL."""
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        return None

@app.route('/track_event', methods=['POST'])
def track_event():
    """
    Menerima event dari frontend dan menyimpannya ke database.
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        event_type = data.get('event_type')
        event_data = data.get('event_data')
        timestamp = data.get('timestamp')

        if not all([user_id, event_type]):
            return jsonify({"error": "Missing user_id or event_type"}), 400

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500

        try:
            cur = conn.cursor()
            query = """
            INSERT INTO user_events (user_id, event_type, event_data, timestamp)
            VALUES (%s, %s, %s, %s)
            """
            cur.execute(query, (user_id, event_type, json.dumps(event_data), timestamp))
            conn.commit()
            cur.close()
            return jsonify({"message": "Event recorded successfully!"}), 201
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Database insert error: {e}")
            return jsonify({"error": f"Failed to record event: {e}"}), 500
        finally:
            conn.close()

    except Exception as e:
        print(f"Error processing track_event: {e}")
        return jsonify({"error": f"Internal server error: {e}"}), 500

@app.route('/get_event_counts', methods=['GET'])
def get_event_counts():
    """
    Mengambil jumlah event per tipe dari database untuk visualisasi tren.
    """
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        query = """
        SELECT event_type, COUNT(*) as count
        FROM user_events
        GROUP BY event_type
        ORDER BY count DESC;
        """
        cur.execute(query)
        result = cur.fetchall()
        cur.close()

        event_counts = [{"event_type": row[0], "count": row[1]} for row in result]
        return jsonify(event_counts), 200
    except psycopg2.Error as e:
        print(f"Database query error: {e}")
        return jsonify({"error": f"Failed to fetch event counts: {e}"}), 500
    finally:
        conn.close()

@app.route('/run_clustering', methods=['GET'])
def run_clustering():
    """
    Mengambil data event, melakukan pra-pemrosesan, dan menjalankan analisis clustering KMeans.
    """
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        query = "SELECT user_id, event_type, timestamp, event_data FROM user_events ORDER BY timestamp ASC;"
        cur.execute(query)
        events = cur.fetchall()
        cur.close()

        print(f"DEBUG: Total events fetched from DB: {len(events)}")
        if not events:
            return jsonify({"message": "No events found for clustering."}), 200

        df = pd.DataFrame(events, columns=['user_id', 'event_type', 'timestamp', 'event_data'])
        print(f"DEBUG: DataFrame head after creation:\n{df.head()}")
        print(f"DEBUG: DataFrame dtypes after creation:\n{df.dtypes}")

        user_features = {}
        unique_users = df['user_id'].unique()
        print(f"DEBUG: Unique users found: {len(unique_users)}")

        for user_id in unique_users:
            user_df = df[df['user_id'] == user_id]
            total_events = len(user_df)
            event_type_counts = user_df['event_type'].value_counts().to_dict()

            avg_duration = 0
            duration_events = user_df[user_df['event_type'] == 'page_view_duration']
            if not duration_events.empty:
                durations = []
                for e_data in duration_events['event_data']:
                    if isinstance(e_data, dict) and 'duration_seconds' in e_data:
                        try:
                            duration_val = float(e_data['duration_seconds'])
                            durations.append(duration_val)
                        except (ValueError, TypeError):
                            pass
                
                if durations:
                    avg_duration = np.mean(durations)

            user_features[user_id] = {
                'total_events': total_events,
                'click_count': event_type_counts.get('click', 0),
                'scroll_count': event_type_counts.get('scroll', 0),
                'page_view_count': event_type_counts.get('page_view', 0),
                'avg_page_view_duration': avg_duration
            }
        
        features_df = pd.DataFrame.from_dict(user_features, orient='index')
        features_df.index.name = 'user_id'
        print(f"DEBUG: features_df before numeric conversion:\n{features_df.head()}")
        print(f"DEBUG: features_df dtypes before numeric conversion:\n{features_df.dtypes}")

        for col in features_df.columns:
            features_df[col] = pd.to_numeric(features_df[col], errors='coerce').fillna(0)
        
        print(f"DEBUG: features_df after numeric conversion and fillna:\n{features_df.head()}")
        print(f"DEBUG: features_df dtypes after numeric conversion and fillna:\n{features_df.dtypes}")

        if features_df.empty:
            return jsonify({"message": "No valid numerical features found for clustering after preprocessing.", "total_users_analyzed": 0}), 200

        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features_df)
        print(f"DEBUG: Shape of scaled_features: {scaled_features.shape}")

        num_clusters = min(5, len(features_df))
        print(f"DEBUG: Number of users for clustering: {len(features_df)}, Calculated num_clusters: {num_clusters}")
        if num_clusters < 2:
             return jsonify({"message": "Not enough unique users to perform clustering (need at least 2).", "total_users_analyzed": len(features_df)}), 200

        kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
        features_df['cluster'] = kmeans.fit_predict(scaled_features)
        print(f"DEBUG: features_df with cluster assignments:\n{features_df.head()}")

        cluster_results = {}
        for cluster_id in range(num_clusters):
            cluster_users = features_df[features_df['cluster'] == cluster_id]
            avg_features = cluster_users.drop('cluster', axis=1).mean().to_dict()
            
            cluster_results[cluster_id] = {
                "users": cluster_users.index.tolist(),
                "average_features": avg_features
            }
        print(f"DEBUG: Cluster results prepared: {cluster_results}")

        return jsonify({
            "message": "Clustering performed successfully!",
            "num_clusters": num_clusters,
            "total_users_analyzed": len(features_df),
            "clusters": cluster_results
        }), 200

    except Exception as e:
        print(f"Error performing clustering: {e}")
        if "dtypes are not compatible" in str(e):
             return jsonify({"error": f"Failed to perform clustering due to incompatible data types. Ensure all features are numeric. Detail: {e}"}), 500
        return jsonify({"error": f"Failed to perform clustering: {e}"}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
