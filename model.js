const table = `CREATE TABLE IF NOT EXISTS todos (
	id TEXT PRIMARY KEY,
   	todo_description TEXT NOT NULL,
	todo_responsible TEXT DEFAULT "NA",
	todo_priority TEXT,
    todo_completed INTEGER,
    todo_deleted INTEGER DEFAULT 0
)`;

module.exports = {
    table: table
};