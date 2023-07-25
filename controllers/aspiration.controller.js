const { Op } = require('sequelize');

const Aspiration = require('../models').Aspiration;
const Image = require('../models').Image;
const User = require('../models').User;

exports.addAspiration = async (req, res) => {
  try {
    const { judul, deskripsi, lokasi } = req.body;
    const data = {
      user_id: req.userId,
      judul,
      deskripsi,
      lokasi,
    };
    const aspiration = await Aspiration.create(data);
    const image = [];

    for (let i = 0; i < req.files.length; i++) {
      const link = `${req.protocol}://${req.get('host')}/${
        req.files[i].filename
      }`;

      await Image.create({ aspirasi_id: aspiration.id, url: link });

      image.push(link);
    }
    const response = {
      status_response: true,
      message: 'Aspirasi berhasil ditambahkan',
      errors: null,
      data: { ...aspiration.dataValues, image },
    };
    res.status(200).send(response);
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

exports.getAllAspirations = async (req, res) => {
  try {
    const { email, nik, status, judul, limit = 10, offset = 0 } = req.query;
    const where = {};

    if (email) {
      where['$User.email$'] = email;
    }
    if (nik) {
      where['$User.nik$'] = nik;
    }
    if (judul) {
      where['$Aspiration.judul$'] = {
        [Op.like]: `%${judul}%`,
      };
    }
    if (status) {
      where['$Aspiration.status$'] = status;
    }

    const data = await Aspiration.findAll({
      include: [
        { model: Image, attributes: ['id', 'url'] },
        {
          model: User,
          attributes: ['id', 'nama', 'email', 'nik'],
          where,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      where: where,
    });

    const response = {
      status_response: true,
      message: 'Daftar aspirasi',
      errors: null,
      data,
    };

    res.status(200).send(response);
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

exports.getAspirationById = async (req, res) => {
  try {
    const { id } = req.params;
    const theAspiration = await Aspiration.findByPk(id, {
      include: {
        model: Image,
        where: { aspirasi_id: id },
        attributes: ['url', 'aspirasi_id'],
      },
    });
    if (theAspiration === null || !theAspiration) {
      return res.status(404).send('not found');
    }
    const response = {
      status_response: true,
      message: 'Detail aspirasi',
      errors: null,
      data: theAspiration,
    };
    res.status(200).send(response);
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

exports.getUserAspirations = async (req, res) => {
  try {
    const id = req.userId;
    const theAspirations = await Aspiration.findAll({
      include: [
        { model: Image, attributes: ['id', 'url'] },
        {
          model: User,
          attributes: ['id', 'nama', 'email', 'nik'],
        },
      ],
      where: { user_id: id },
    });
    if (theAspirations === null || !theAspirations) {
      return res.status(404).send('not found');
    }
    const response = {
      status_response: true,
      message: `Aspirasi user`,
      errors: null,
      data: theAspirations,
    };
    res.status(200).send(response);
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

exports.updateAspAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, komentar } = req.body;

    const aspiration = await Aspiration.findOne({
      where: { id },
    });

    if (!aspiration) {
      const notFound = {
        status_response: false,
        message: 'Aspirasi tidak di temukan',
        errors: 'Not Found',
        data: null,
      };
      return res.status(404).send(notFound);
    }

    const data = { status };

    if (status !== 'Done' || status !== 'Processed') {
      const response = {
        status_response: false,
        message: `Status aspirasi hanya dapat diubah menjadi 'Processed' atau 'Done'`,
        errors: 'Bad request',
        data: null,
      };
      return res.status(400).send(response);
    }

    if (status === 'Done') {
      if (!komentar) {
        const response = {
          status_response: false,
          message: `Aspirasi yang telah 'DONE' harus menyertakan komentar`,
          errors: 'Bad request',
          data: null,
        };
        return res.status(400).send(response);
      }
      data.komentar = komentar;
    }
    const updatdAsp = await Aspiration.update(data, { where: { id } });

    const response = {
      status_response: true,
      message: 'Aspirasi berhasil di update',
      errors: null,
      data: updatdAsp,
    };

    res.status(200).send(response);
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
