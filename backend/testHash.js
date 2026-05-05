const bcrypt = require('bcryptjs');

const hash = '$2a$10$tZ2.Q2xN9iUjP.Z8m1Q/iOgL1.tM8r2H1yL2E9xUuU7eT9sWbYm.q';
const password = 'admin123';

bcrypt.compare(password, hash).then(res => {
    console.log('Match:', res);
});
