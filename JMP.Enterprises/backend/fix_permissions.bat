@echo off
echo Stopping SQL Server SQLEXPRESS...
net stop MSSQL$SQLEXPRESS /y

echo Starting SQL Server in single-user mode...
start /b "" "C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\Binn\sqlservr.exe" -sSQLEXPRESS -m
timeout /t 5 /nobreak

echo Granting dbcreator role...
sqlcmd -S localhost\SQLEXPRESS -Q "ALTER SERVER ROLE dbcreator ADD MEMBER [LAPTOP-9M5232LD\FaithClothing]; PRINT 'SUCCESS: dbcreator role granted!'" -C

echo Stopping single-user mode...
sqlcmd -S localhost\SQLEXPRESS -Q "SHUTDOWN WITH NOWAIT" -C
timeout /t 5 /nobreak

echo Restarting SQL Server normally...
net start MSSQL$SQLEXPRESS

echo Done! You can close this window.
pause
