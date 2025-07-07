from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import json
from sklearn.cluster import KMeans
import pandas as pd
import numpy as np

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
        # Ambil semua event untuk analisis
        query = "SELECT user_id, event_type, timestamp, event_data FROM user_events ORDER BY timestamp ASC;"
        cur.execute(query)
        events = cur.fetchall()
        cur.close()

        if not events:
            return jsonify({"message": "No events found for clustering."}), 200

        # Konversi ke DataFrame Pandas
        df = pd.DataFrame(events, columns=['user_id', 'event_type', 'timestamp', 'event_data'])

        # Pra-pemrosesan Data untuk Clustering
        # Contoh: Fitur berdasarkan frekuensi event dan durasi interaksi
        user_features = {}
        for user_id in df['user_id'].unique():
            user_df = df[df['user_id'] == user_id]

            # Fitur 1: Jumlah total event
            total_events = len(user_df)

            # Fitur 2: Frekuensi masing-masing tipe event
            event_type_counts = user_df['event_type'].value_counts().to_dict()

            # Fitur 3: Rata-rata durasi interaksi (jika ada event page_view_duration)
            avg_duration = 0
            duration_events = user_df[user_df['event_type'] == 'page_view_duration']
            if not duration_events.empty:
                durations = [e.get('duration_seconds', 0) for e in duration_events['event_data'] if isinstance(e, dict)]
                if durations: # Pastikan ada durasi yang valid
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
        
        # Penanganan Missing Values (jika ada) dan Normalisasi (penting untuk KMeans)
        features_df = features_df.fillna(0) # Ganti NaN dengan 0
        
        # Skala fitur agar KMeans bekerja lebih baik
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features_df)

        # Menentukan jumlah kluster (bisa diatur manual atau menggunakan metode elbow/silhouette score)
        # Untuk contoh ini, kita set manual 3-5 kluster
        num_clusters = min(5, len(features_df)) # Maksimal 5 kluster, atau sebanyak jumlah pengguna jika kurang
        if num_clusters < 2:
             return jsonify({"message": "Not enough unique users to perform clustering (need at least 2).", "total_users_analyzed": len(features_df)}), 200

        kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10) # n_init for modern scikit-learn
        features_df['cluster'] = kmeans.fit_predict(scaled_features)

        # Siapkan hasil untuk dikirim ke frontend
        cluster_results = {}
        for cluster_id in range(num_clusters):
            cluster_users = features_df[features_df['cluster'] == cluster_id]
            
            # Hitung rata-rata fitur untuk kluster ini (untuk ciri-ciri kluster)
            avg_features = cluster_users.drop('cluster', axis=1).mean().to_dict()
            
            cluster_results[cluster_id] = {
                "users": cluster_users.index.tolist(),
                "average_features": avg_features
            }

        return jsonify({
            "message": "Clustering performed successfully!",
            "num_clusters": num_clusters,
            "total_users_analyzed": len(features_df),
            "clusters": cluster_results
        }), 200

    except Exception as e:
        print(f"Error performing clustering: {e}")
        return jsonify({"error": f"Failed to perform clustering: {e}"}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True) # debug=True akan mereload server saat ada perubahan kode