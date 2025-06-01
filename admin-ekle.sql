-- Admin kullanıcısı ekleme sorgusu
INSERT INTO users (email, name, password, role)
VALUES (
  'admin@gmail.com',
  'Admin',
  '$2a$10$8wiouOzzXsqdyzDOxe97w.IXZKDEoXGfbFNp.rh3zR9K.xRut0ry.',
  'admin'
); 