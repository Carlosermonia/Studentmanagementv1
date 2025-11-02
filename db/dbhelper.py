from sqlite3 import connect, Row
from typing import Any, List

database: str = 'db/school.db'


def _get_conn():
    conn = connect(database)
    conn.row_factory = Row
    return conn


def getprocess(sql: str, vals: List[Any]) -> List[Row]:
    
    conn = _get_conn()
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute(sql, vals)
        data = cursor.fetchall()
        return data
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def postprocess(sql: str, vals: List[Any]) -> bool:
    
    conn = None
    cursor = None
    try:
        conn = connect(database)
        cursor = conn.cursor()
        cursor.execute(sql, vals)
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        
        print(f"DB Error: {e}")
        return False
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def getall(table: str) -> List[Row]:
    
    sql: str = f"SELECT * FROM `{table}`"
    return getprocess(sql, [])


def getrecord(table: str, **kwargs) -> List[Row]:
    
    keys = list(kwargs.keys())
    vals = list(kwargs.values())
    if not keys:
        raise ValueError("getrecord requires at least one key=value")
    flds = [f"`{k}` = ?" for k in keys]
    fields = " AND ".join(flds)
    sql = f"SELECT * FROM `{table}` WHERE {fields}"
    return getprocess(sql, vals)


def addrecord(table: str, **kwargs) -> bool:
    
    keys = list(kwargs.keys())
    vals = list(kwargs.values())
    placeholders = ",".join(["?"] * len(keys))
    fields = "`,`".join(keys)
    sql = f"INSERT INTO `{table}` (`{fields}`) VALUES ({placeholders})"
    return postprocess(sql, vals)


def deleterecord(table: str, **kwargs) -> bool:
    
    keys = list(kwargs.keys())
    vals = list(kwargs.values())
    if not keys:
        raise ValueError("deleterecord requires at least one key=value")
    flds = [f"`{k}` = ?" for k in keys]
    fields = " AND ".join(flds)
    sql = f"DELETE FROM `{table}` WHERE {fields}"
    return postprocess(sql, vals)


def updaterecord(table: str, **kwargs) -> bool:
    
    keys = list(kwargs.keys())
    vals = list(kwargs.values())

    if len(keys) < 2:
        raise ValueError("updaterecord requires at least one WHERE key and one field to update")

    where_key = keys[0]
    where_val = vals[0]

    set_keys = keys[1:]
    set_vals = vals[1:]

    set_clause = ", ".join([f"`{k}` = ?" for k in set_keys])
    sql = f"UPDATE `{table}` SET {set_clause} WHERE `{where_key}` = ?"

    params = set_vals + [where_val]
    return postprocess(sql, params)