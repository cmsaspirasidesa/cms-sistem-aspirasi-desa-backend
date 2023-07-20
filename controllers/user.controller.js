const User = require('../models').User;
const Role = require('../models').Role;

exports.findAllUser = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, where: { id: 1 }, attributes: ['id', 'nama_role'] },
      ],
      attributes: ['id', 'nama', 'email', 'alamat', 'nik', 'createdAt'],
    });
    const response = {
      status_response: true,
      message: 'Semua data user',
      errors: null,
      data: users,
    };
    res.status(200).json(response);
  } catch (error) {
    const response = {
      status_response: false,
      message: error.message,
      errors: error,
      data: null,
    };
    res.status(500).send(response);
  }
};
