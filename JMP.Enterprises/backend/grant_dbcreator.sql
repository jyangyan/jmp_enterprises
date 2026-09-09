-- Grant dbcreator role to the current Windows user
ALTER SERVER ROLE dbcreator ADD MEMBER [LAPTOP-9M5232LD\FaithClothing];
GO
PRINT 'dbcreator role granted to LAPTOP-9M5232LD\FaithClothing';
GO
