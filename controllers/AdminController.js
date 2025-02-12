import AdminModel from "../models/AdminModel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/Cloudinary.js";

export const getAdmin = async (req, res) => {
  try {
    const refreshToken = req.params.token;
    if (!refreshToken) return res.sendStatus(204);

    const response = await AdminModel.findOne({
      where: {
        token: refreshToken
      }
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const createAdmin = async (req, res) => {
  if (
    !req.body.name ||
    !req.body.jenis_kelamin ||
    !req.body.email ||
    !req.body.password ||
    !req.body.confirmPassword ||
    !req.body.file
  ) {
    return res.status(400).json({ msg: "Tolong masukan semua inputan" });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res
      .status(400)
      .json({ msg: "Password dan konfirmasi password tidak sesuai" });
  }
  const nickname = req.body.name;
  const jenis_kelamin = req.body.jenis_kelamin;
  const role = "admin";
  const email = req.body.email;
  const password = req.body.password;
  const hashPassword = await argon2.hash(password);
  const file = req.body.file;

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "admins"
    });
    if (result.length !== 0) {
      await AdminModel.create({
        name: nickname,
        jenis_kelamin: jenis_kelamin,
        role: role,
        email: email,
        password: hashPassword,
        url: result.url,
        img_id: result.public_id
      });
      res.status(201).json({ msg: "Behasil registrasi" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};
export const updateAdmin = async (req, res) => {
  if (
    !req.body.name ||
    !req.body.jenis_kelamin ||
    !req.body.email ||
    !req.body.password ||
    !req.body.confirmPassword ||
    !req.body.file
  ) {
    return res.status(400).json({ msg: "Masukan semua inputan" });
  }
  const refreshToken = req.params.token;
  if (!refreshToken) return res.sendStatus(204);

  const admin = await AdminModel.findOne({
    where: {
      token: refreshToken
    }
  });
  if (!admin) return res.status(404).json({ msg: "Admin tidak ditemukan" });

  const { name, email, password, confirmPassword, jenis_kelamin, file } =
    req.body;
  const role = "admin";
  if (password !== confirmPassword) {
    res
      .status(400)
      .json({ msg: "Password dan konfirmasi password tidak sesuai" });
  }
  const hashPassword = await argon2.hash(password);

  const imgId = admin.img_id;
  await cloudinary.uploader.destroy(imgId);
  const result = await cloudinary.uploader.upload(file, {
    folder: "admins"
  });
  if (result.length !== 0) {
    try {
      await AdminModel.update(
        {
          name: name,
          jenis_kelamin: jenis_kelamin,
          role: role,
          email: email,
          password: hashPassword,
          url: result.url,
          img_id: result.public_id
        },
        {
          where: {
            id: admin.id
          }
        }
      );
      res.status(200).json({ msg: "admin berhasil Update" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  }
};
export const deleteAdmin = async (req, res) => {
  try {
    const refreshToken = req.params.token;
    if (!refreshToken) return res.sendStatus(204);

    const admin = await AdminModel.findOne({
      where: {
        token: refreshToken
      }
    });
    const adminId = admin.id;
    if (!admin) return res.status(404).json({ msg: "admin tidak ditemukan" });
    try {
      const imgId = admin.img_id;
      await cloudinary.uploader.destroy(imgId);
      await AdminModel.destroy({
        where: {
          id: adminId
        }
      });
      res.status(200).json({ msg: "Berhasil menghapus akun" });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const Login = async (req, res) => {
  if (!req.body.email || !req.body.email) {
    return res.status(400).json({ msg: "Masukan semua input" });
  }
  const admin = await AdminModel.findOne({
    where: {
      email: req.body.email
    }
  });
  if (!admin) {
    return res.status(404).json({ msg: "Email atau password salah" });
  }
  const match = await argon2.verify(admin.password, req.body.password);
  if (!match) {
    return res.status(404).json({ msg: "Email atau password salah" });
  }
  const adminId = admin.id;
  const SECRET_KEY =
    "dasdf213rwq079123478khh12kehkwe89789ysudkh12987ydhkhasdty638tasd";
  const refreshToken = jwt.sign({ adminId }, SECRET_KEY, {
    expiresIn: "1d"
  });
  await AdminModel.update(
    {
      token: refreshToken
    },
    {
      where: {
        id: adminId
      }
    }
  );
  res.status(200).json(refreshToken);
};

export const Logout = async (req, res) => {
  const refreshToken = req.params.token;
  if (!refreshToken) return res.sendStatus(204);
  try {
    const admin = await AdminModel.findOne({
      where: {
        token: refreshToken
      }
    });
    if (!admin) return res.status(404).json({ msg: "Admin tidak ditemukan" });
    await AdminModel.update(
      {
        token: null
      },
      {
        where: {
          token: admin.token
        }
      }
    );
    return res.status(200).json({ msg: "behasil logout" });
  } catch (error) {
    console.log(error);
  }
};
