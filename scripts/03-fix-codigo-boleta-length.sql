-- Aumentar el tamaño del campo codigo_boleta para acomodar códigos más largos
ALTER TABLE citas 
ALTER COLUMN codigo_boleta TYPE VARCHAR(50);

-- Comentario: El código de boleta se genera con formato CITA-timestamp-random
-- que puede tener hasta 40 caracteres, por lo que aumentamos a 50 para seguridad
