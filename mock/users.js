// simple mock user database for login POC
// two types: 'player' and 'admin'

const users = [
  {
    employeeNumber: '1001',
    password: 'password',
    role: 'player',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    employeeNumber: '1002',
    password: 'password',
    role: 'player',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  {
    employeeNumber: '9999',
    password: 'admin123',
    role: 'admin',
    name: 'Super Admin',
  },
];

export function authenticate(employeeNumber, password, role) {
  return users.find(
    (u) =>
      u.employeeNumber === employeeNumber &&
      u.password === password &&
      u.role === role
  );
}

export default users;
