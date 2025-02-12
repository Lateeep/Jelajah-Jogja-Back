import GalleryModel from "../models/GalleryModel.js";
import WisataModel from "../models/WisataModel.js";
import cloudinary from "../utils/Cloudinary.js";

export const getGalleryByWisataId = async (req, res) => {
  try {
    const response = await GalleryModel.findAll(
      {
        where: {
          wisatumId: req.params.id
        }
      },
      {
        include: [
          {
            model: WisataModel
          }
        ]
      }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getGalleryById = async (req, res) => {
  try {
    const response = await GalleryModel.findOne({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createGallery = async (req, res) => {
  if (!req.body.file) {
    return res.status(400).json({ msg: "File gambar tolong dimasukan" });
  }
  const id = req.params.id;
  const file = req.body.file;
  const result = await cloudinary.uploader.upload(file, {
    folder: "galeri"
  });
  if (result.length !== 0) {
    try {
      await GalleryModel.create({
        url: result.url,
        img_id: result.public_id,
        wisatumId: id
      });
      res.status(201).json({ msg: "Foto berhasil ditambah" });
    } catch (error) {
      console.log(error.message);
    }
  }
};

export const deleteGallery = async (req, res) => {
  try {
    const foto = await GalleryModel.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!foto) return res.status(404).json({ msg: "Foto tidak ditemukan" });
    try {
      const imgId = foto.img_id;
      await cloudinary.uploader.destroy(imgId);

      await GalleryModel.destroy({
        where: {
          id: foto.id
        }
      });
      res.status(200).json({ msg: "Foto berhasil dihapus" });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error.message);
  }
};
