import WisataModel from "../models/WisataModel.js";
import ReviewModel from "../models/ReviewModel.js";
import HotelModel from "../models/HotelModel.js";
import ReviewHotelModel from "../models/ReviewHotelModel.js";
import GalleryModel from "../models/GalleryModel.js";
import cloudinary from "../utils/Cloudinary.js";

export const getWisata = async (req, res) => {
  try {
    const response = await WisataModel.findAll();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getWisataById = async (req, res) => {
  try {
    const response = await WisataModel.findOne({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const createWisata = async (req, res) => {
  if (
    !req.body.nama ||
    !req.body.kategori ||
    !req.body.lokasi ||
    !req.body.deskripsi ||
    !req.body.latitude ||
    !req.body.longitude ||
    !req.body.file
  ) {
    return res.status(400).json({ msg: "Masukan semua inputan" });
  }

  const { nama, kategori, lokasi, deskripsi, latitude, longitude, file } =
    req.body;

  const result = await cloudinary.uploader.upload(file, {
    folder: "wisata"
  });
  if (result.length !== 0) {
    try {
      await WisataModel.create({
        nama: nama,
        kategori: kategori,
        lokasi: lokasi,
        deskripsi: deskripsi,
        url: result.url,
        img_id: result.public_id,
        latitude: latitude,
        longitude: longitude
      });
      res.status(201).json({ msg: "Wisata berhasil ditambah" });
    } catch (error) {
      console.log(error.message);
    }
  }
};
export const updateWisata = async (req, res) => {
  try {
    const wisata = await WisataModel.findOne({
      where: { id: req.params.id }
    });
    
    if (!wisata) return res.status(404).json({ msg: "Wisata tidak ditemukan" });

    const { nama, kategori, lokasi, deskripsi, latitude, longitude, file } = req.body;

    let updateData = {
      nama: nama || wisata.nama,
      kategori: kategori || wisata.kategori,
      lokasi: lokasi || wisata.lokasi,
      deskripsi: deskripsi || wisata.deskripsi,
      latitude: latitude || wisata.latitude,
      longitude: longitude || wisata.longitude
    };

    if (file) {
      // Hapus gambar lama jika ada
      if (wisata.img_id) {
        await cloudinary.uploader.destroy(wisata.img_id);
      }

      // Upload gambar baru
      const result = await cloudinary.uploader.upload(file, {
        folder: "wisata"
      });

      updateData.url = result.url;
      updateData.img_id = result.public_id;
    }

    await WisataModel.update(updateData, {
      where: { id: wisata.id }
    });

    res.status(200).json({ 
      msg: "Wisata berhasil diupdate",
      data: updateData 
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const deleteWisata = async (req, res) => {
  try {
    const wisata = await WisataModel.findOne({
      where: { id: req.params.id }
    });

    if (!wisata) return res.status(404).json({ msg: "Wisata tidak ditemukan" });

    // Hapus hotel dan review hotel yang berelasi
    const hotels = await HotelModel.findAll({ where: { wisatumId: wisata.id } });

    if (hotels.length > 0) {
      for (const hotel of hotels) {
        try {
          if (hotel.img_id) await cloudinary.uploader.destroy(hotel.img_id);

          await HotelModel.destroy({ where: { id: hotel.id } });

          await ReviewHotelModel.destroy({ where: { hotelId: hotel.id } });
        } catch (error) {
          console.error(`Gagal menghapus hotel ID: ${hotel.id}`, error);
        }
      }
    }

    // Hapus review yang berelasi
    await ReviewModel.destroy({ where: { wisatumId: wisata.id } });

    // Hapus gallery yang berelasi
    const galleries = await GalleryModel.findAll({ where: { wisatumId: wisata.id } });

    if (galleries.length > 0) {
      for (const data of galleries) {
        try {
          if (data.img_id) await cloudinary.uploader.destroy(data.img_id);

          await GalleryModel.destroy({ where: { id: data.id } });
        } catch (error) {
          console.error(`Gagal menghapus gallery ID: ${data.id}`, error);
        }
      }
    }

    // Hapus gambar utama wisata
    if (wisata.img_id) await cloudinary.uploader.destroy(wisata.img_id);

    // Hapus wisata
    await WisataModel.destroy({ where: { id: wisata.id } });

    res.status(200).json({ msg: "Wisata berhasil dihapus" });
  } catch (error) {
    console.error("Error saat menghapus wisata:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat menghapus wisata" });
  }
};
