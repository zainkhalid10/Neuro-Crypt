from flask import Flask, request, jsonify
import sqlite3
import os
from flask_cors import CORS

DB_PATH = os.path.join(os.path.dirname(__file__), 'neurocrypt.db')

app = Flask(__name__)
CORS(app)

# Ensure table exists
with sqlite3.connect(DB_PATH) as conn:
    conn.execute('''
        CREATE TABLE IF NOT EXISTS simulator_state (
            user_id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL
        )
    ''')
    conn.commit()

@app.route('/simulator/<user_id>', methods=['GET'])
def get_simulator_state(user_id):
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute('SELECT state_json FROM simulator_state WHERE user_id = ?', (user_id,))
        row = cur.fetchone()
        if row:
            return jsonify({'state': row[0]}), 200
        else:
            return jsonify({'state': None}), 200

@app.route('/simulator/<user_id>', methods=['POST'])
def save_simulator_state(user_id):
    data = request.get_json()
    state_json = data.get('state')
    if not state_json:
        return jsonify({'error': 'Missing state'}), 400
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('REPLACE INTO simulator_state (user_id, state_json) VALUES (?, ?)', (user_id, state_json))
        conn.commit()
    return jsonify({'success': True}), 200

@app.route('/simulator/<user_id>', methods=['DELETE'])
def delete_simulator_state(user_id):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('DELETE FROM simulator_state WHERE user_id = ?', (user_id,))
        conn.commit()
    return jsonify({'success': True}), 200

@app.route('/simulator/all', methods=['GET'])
def get_all_simulator_states():
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute('SELECT user_id, state_json FROM simulator_state')
        rows = cur.fetchall()
        data = [{'user_id': row[0], 'state': row[1]} for row in rows]
    return jsonify({'simulations': data}), 200

@app.route('/simulator/clear-all', methods=['DELETE'])
def clear_all_simulator_states():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            # Delete all records
            conn.execute('DELETE FROM simulator_state')
            conn.commit()
            
            # Verify deletion
            cur = conn.execute('SELECT COUNT(*) FROM simulator_state')
            count = cur.fetchone()[0]
            
            if count == 0:
                return jsonify({
                    'success': True, 
                    'message': 'All simulation data cleared',
                    'verification': 'Database is empty'
                }), 200
            else:
                return jsonify({
                    'success': False, 
                    'message': f'Failed to clear database. {count} records remaining'
                }), 500
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Database error: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True) 