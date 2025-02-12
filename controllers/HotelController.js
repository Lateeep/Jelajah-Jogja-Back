import HotelModel from "../models/HotelModel.js";
import HotelBobotModel from "../models/HotelBobotModel.js";
import WisataModel from "../models/WisataModel.js";
import cloudinary from "../utils/Cloudinary.js";
import { QueryTypes } from 'sequelize';
import db from "../config/Database.js";

export const getAllHotel = async (req, res) => {
  try {
    console.log('Mengambil data hotel...');
    const response = await HotelModel.findAll({
      include: [
        {
          model: WisataModel
        }
      ]
    });
    console.log('Data hotel berhasil diambil:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error di getAllHotel:', error);
    res.status(500).json({ msg: error.message });
  }
};
export const getHotelByWisataId = async (req, res) => {
  try {
    const response = await HotelModel.findAll(
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

export const getHotelById = async (req, res) => {
  try {
    const response = await HotelModel.findOne({
      where: {
        id: req.params.id
      }
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const createHotel = async (req, res) => {
  if (!req.body.nama || !req.body.lokasi || !req.body.deskripsi) {
    return res.status(400).json({ msg: "Masukan semua inputan" });
  }

  const { 
    nama, 
    lokasi, 
    deskripsi, 
    max_harga, 
    type_kamar, 
    fasilitas, 
    latitude, 
    longitude, 
    file,
    bobot_harga,
    bobot_jarak,
    bobot_tipe_kamar,
    bobot_fasilitas
  } = req.body;

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "hotel"
    });

    if (result.length !== 0) {
      const newHotel = await HotelModel.create({
        nama,
        lokasi,
        deskripsi,
        url: result.url,
        img_id: result.public_id,
        max_harga,
        type_kamar,
        fasilitas,
        latitude,
        longitude,
        total_rating: 0,
        total_viewers: 0,
        rating: 0
      });

      const total_bobot = (
        parseFloat(bobot_harga || 0) +
        parseFloat(bobot_jarak || 0) +
        parseFloat(bobot_tipe_kamar || 0) +
        parseFloat(bobot_fasilitas || 0)
      );

      await HotelBobotModel.create({
        hotel_id: newHotel.id,
        bobot_harga: bobot_harga || 0,
        bobot_jarak: bobot_jarak || 0,
        bobot_tipe_kamar: bobot_tipe_kamar || 0,
        bobot_fasilitas: bobot_fasilitas || 0,
        total_bobot
      });

      res.status(201).json({ msg: "Hotel dan bobot berhasil ditambah" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};
export const updateHotel = async (req, res) => {
  try {
    const hotel = await HotelModel.findOne({
      where: { id: req.params.id }
    });
    
    if (!hotel) return res.status(404).json({ msg: "Hotel tidak ditemukan" });

    const { 
      nama, 
      lokasi, 
      deskripsi, 
      max_harga,
      type_kamar,
      fasilitas,
      latitude,
      longitude,
      file 
    } = req.body;

    const updateData = {
      nama: nama || hotel.nama,
      lokasi: lokasi || hotel.lokasi,
      deskripsi: deskripsi || hotel.deskripsi,
      max_harga: parseFloat(max_harga) || hotel.max_harga,
      type_kamar: type_kamar || hotel.type_kamar,
      fasilitas: fasilitas || hotel.fasilitas,
      latitude: latitude ? parseFloat(latitude) : hotel.latitude,
      longitude: longitude ? parseFloat(longitude) : hotel.longitude
    };

    if (file) {
      if (hotel.img_id) {
        await cloudinary.uploader.destroy(hotel.img_id);
      }

      const result = await cloudinary.uploader.upload(file, {
        folder: "hotel"
      });

      updateData.url = result.url;
      updateData.img_id = result.public_id;
    }

    await HotelModel.update(updateData, {
      where: { id: hotel.id }
    });

    const updatedHotel = await HotelModel.findOne({
      where: { id: hotel.id }
    });

    res.status(200).json({ 
      msg: "Hotel berhasil diupdate",
      data: updatedHotel
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await HotelModel.findOne({
      where: { id: req.params.id }
    });
    
    if (!hotel) return res.status(404).json({ msg: "Hotel tidak ditemukan" });

    const imgId = hotel.img_id;
    await cloudinary.uploader.destroy(imgId);

    await HotelModel.destroy({
      where: { id: hotel.id }
    });
    res.status(200).json({ msg: "Hotel berhasil dihapus" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const getHotelRekomendasi = async (req, res) => {
  try {
    const { k = 3 } = req.query;
    
    const rekomendasi = await HotelBobotModel.findAll({
      include: [{
        model: HotelModel,
        attributes: ['nama', 'lokasi', 'fasilitas', 'type_kamar', 'max_harga']
      }],
      order: [['total_bobot', 'DESC']],
      limit: parseInt(k)
    });

    res.status(200).json(rekomendasi);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateAllHotelBobot = async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    const {
      bobot_harga,
      bobot_jarak,
      bobot_tipe_kamar,
      bobot_fasilitas
    } = req.body;

    // Validasi bobot
    const bobotData = {
      bobot_harga: parseFloat(bobot_harga) || 0,
      bobot_jarak: parseFloat(bobot_jarak) || 0,
      bobot_tipe_kamar: parseFloat(bobot_tipe_kamar) || 0,
      bobot_fasilitas: parseFloat(bobot_fasilitas) || 0,
    };

    const total_bobot = Object.values(bobotData).reduce((sum, value) => sum + value, 0);
    
    // Validasi total bobot
    if (Math.abs(total_bobot - 1) > 0.0001) {
      return res.status(400).json({
        msg: "Total bobot harus sama dengan 1",
        total_bobot
      });
    }

    bobotData.total_bobot = total_bobot;

    // Cek apakah sudah ada data bobot
    const existingBobot = await HotelBobotModel.findOne();

    if (existingBobot) {
      await HotelBobotModel.update(bobotData, {
        where: { id: existingBobot.id }
      });
      console.log('Updated existing bobot');
    } else {
      await HotelBobotModel.create(bobotData);
      console.log('Created new bobot');
    }

    res.status(200).json({ 
      msg: "Bobot berhasil diperbarui",
      data: bobotData
    });

  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ 
      msg: "Error server: " + error.message,
      error: error.stack
    });
  }
};

// Tambahkan fungsi untuk mengambil bobot
export const getBobot = async (req, res) => {
  try {
    const bobot = await HotelBobotModel.findOne();
    if (!bobot) {
      return res.status(404).json({ msg: "Bobot belum diatur" });
    }
    res.status(200).json(bobot);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Pindahkan fungsi Haversine ke dalam controller
const toRad = (value) => {
  return value * Math.PI / 180;
};

const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
           Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Jarak dalam kilometer
  
  return distance;
};

// Fungsi normalisasi nilai
const normalize = (value, min, max) => {
  if (max === min) return 1;
  return (value - min) / (max - min);
};

export const getHotelRecommendations = async (req, res) => {
  try {
    console.log('=== Request diterima ===');
    console.log('Request Body:', req.body);
    
    // Ambil data hotel
    let hotels = await HotelModel.findAll();
    console.log('=== Data Hotel ===');
    console.log('Total hotel:', hotels.length);

    // Konversi string fasilitas ke objek boolean
    let filteredHotels = hotels.map(hotel => {
      // Parse JSON string ke objek
      let fasilitasObj = {};
      try {
        fasilitasObj = JSON.parse(hotel.fasilitas);
      } catch (e) {
        console.error(`Error parsing fasilitas for ${hotel.nama}:`, e);
        return null;
      }

      console.log(`\nHotel ${hotel.nama} fasilitas:`, {
        raw: hotel.fasilitas,
        parsed: fasilitasObj
      });

      return {
        ...hotel.toJSON(),
        ac: fasilitasObj.ac || false,
        tv: fasilitasObj.tv || false,
        wifi: fasilitasObj.internet || false,
        breakfast: fasilitasObj.sarapan || false,
        pool: fasilitasObj.kolam_renang || false,
        parking: fasilitasObj.tempat_parkir_luas || false,
        distance: calculateHaversineDistance(
          parseFloat(req.body.wisata_lat),
          parseFloat(req.body.wisata_long),
          hotel.latitude || 0,
          hotel.longitude || 0
        )
      };
    }).filter(hotel => hotel !== null);

    console.log('=== Data Hotel dengan Fasilitas ===');
    filteredHotels.forEach(hotel => {
      console.log(`\nHotel: ${hotel.nama}`);
      console.log({
        fasilitas_raw: hotel.fasilitas,
        fasilitas_parsed: {
          ac: hotel.ac,
          tv: hotel.tv,
          wifi: hotel.wifi,
          breakfast: hotel.breakfast,
          pool: hotel.pool,
          parking: hotel.parking
        }
      });
    });

    // Hitung jarak
    const MAX_DISTANCE = 10; // Maksimal 10 KM
    filteredHotels = filteredHotels.map(hotel => {
      const distance = calculateHaversineDistance(
        parseFloat(req.body.wisata_lat),
        parseFloat(req.body.wisata_long),
        hotel.latitude || 0,
        hotel.longitude || 0
      );

      return {
        ...hotel,
        distance
      };
    });

    console.log('\n=== Setelah hitung jarak ===');
    console.log('Hotels dengan jarak:', filteredHotels.map(h => ({
      nama: h.nama,
      distance: h.distance.toFixed(2) + ' km'
    })));

    // Filter berdasarkan jarak maksimal 10 KM
    filteredHotels = filteredHotels.filter(hotel => hotel.distance <= MAX_DISTANCE);
    console.log('Hotel dalam radius 10 KM:', filteredHotels.length);

    // Filter harga
    if (req.body.max_price) {
      const maxPriceNum = parseFloat(req.body.max_price);
      filteredHotels = filteredHotels.filter(hotel => {
        const hotelPrice = parseFloat(hotel.max_harga || 0);
        console.log(`Hotel ${hotel.nama}: harga ${hotelPrice} <= ${maxPriceNum}`);
        return hotelPrice <= maxPriceNum;
      });
      console.log('Hotel setelah filter harga:', filteredHotels.length);
    }

    // Filter tipe kamar
    if (req.body.room_types) {
      const roomTypeArray = req.body.room_types.split(',').map(type => type.trim().toLowerCase());
      filteredHotels = filteredHotels.filter(hotel => {
        if (!hotel.type_kamar) return true;
        
        let hotelRoomTypes;
        try {
          hotelRoomTypes = JSON.parse(hotel.type_kamar);
        } catch (e) {
          hotelRoomTypes = hotel.type_kamar.split(',');
        }
        
        hotelRoomTypes = hotelRoomTypes.map(type => type.toLowerCase());
        console.log(`Hotel ${hotel.nama}: tipe kamar ${hotelRoomTypes}`);
        
        return roomTypeArray.some(requestedType => 
          hotelRoomTypes.includes(requestedType)
        );
      });
      console.log('Hotel setelah filter tipe kamar:', filteredHotels.length);
    }

    // Filter fasilitas
    if (req.body.ac === 'true') {
      filteredHotels = filteredHotels.filter(hotel => hotel.ac);
      console.log('Hotel dengan AC:', filteredHotels.length);
    }
    if (req.body.tv === 'true') {
      filteredHotels = filteredHotels.filter(hotel => hotel.tv);
      console.log('Hotel dengan TV:', filteredHotels.length);
    }
    if (req.body.wifi === 'true') {
      filteredHotels = filteredHotels.filter(hotel => hotel.wifi);
      console.log('Hotel dengan WiFi:', filteredHotels.length);
    }
    if (req.body.breakfast === 'true') {
      filteredHotels = filteredHotels.filter(hotel => hotel.breakfast);
      console.log('Hotel dengan Breakfast:', filteredHotels.length);
    }
    if (req.body.pool === 'true') {
      filteredHotels = filteredHotels.filter(hotel => hotel.pool);
      console.log('Hotel dengan Pool:', filteredHotels.length);
    }
    if (req.body.parking === 'true') {
      filteredHotels = filteredHotels.filter(hotel => hotel.parking);
      console.log('Hotel dengan Parking:', filteredHotels.length);
    }

    // Ambil bobot dari database
    const weights = await HotelBobotModel.findOne();
    if (!weights) {
      throw new Error('Bobot tidak ditemukan di database');
    }

    console.log('\n=== Bobot yang Digunakan ===');
    console.log({
      bobot_jarak: weights.bobot_jarak,
      bobot_harga: weights.bobot_harga,
      bobot_fasilitas: weights.bobot_fasilitas,
      bobot_tipe_kamar: weights.bobot_tipe_kamar,
      total_bobot: weights.total_bobot
    });

    // Hitung skor untuk setiap hotel
    const hotelsWithScores = filteredHotels.map(hotel => {
      console.log(`\n========= Perhitungan Detail untuk Hotel ${hotel.nama} =========`);

      // Modifikasi bagian perhitungan skor dalam hotelsWithScores.map:

// 1. Perhitungan Skor Jarak
const maxDistance = Math.max(...filteredHotels.map(h => h.distance));
const minDistance = Math.min(...filteredHotels.map(h => h.distance));
// Ubah rumus normalisasi jarak
const distanceScore = maxDistance === minDistance ? 1 : (maxDistance - hotel.distance) / (maxDistance - minDistance);
const weightedDistanceScore = distanceScore * weights.bobot_jarak;

console.log('\n1. Perhitungan Skor Jarak:');
console.log(`   - Jarak hotel: ${hotel.distance.toFixed(2)} km`);
console.log(`   - Jarak terjauh: ${maxDistance.toFixed(2)} km`);
console.log(`   - Jarak terdekat: ${minDistance.toFixed(2)} km`);
console.log(`   - Skor jarak ((${maxDistance.toFixed(2)} - ${hotel.distance.toFixed(2)}) / (${maxDistance.toFixed(2)} - ${minDistance.toFixed(2)})) = ${distanceScore.toFixed(4)}`);
console.log(`   - Skor jarak terbobot (${distanceScore.toFixed(4)} × ${weights.bobot_jarak}) = ${weightedDistanceScore.toFixed(4)}`);

// 2. Perhitungan Skor Harga
const maxPrice = Math.max(...filteredHotels.map(h => h.max_harga));
const minPrice = Math.min(...filteredHotels.map(h => h.max_harga));
// Ubah rumus normalisasi harga
const priceScore = maxPrice === minPrice ? 1 : (maxPrice - hotel.max_harga) / (maxPrice - minPrice);
const weightedPriceScore = priceScore * weights.bobot_harga;

console.log('\n2. Perhitungan Skor Harga:');
console.log(`   - Harga hotel: Rp ${hotel.max_harga.toLocaleString()}`);
console.log(`   - Harga tertinggi: Rp ${maxPrice.toLocaleString()}`);
console.log(`   - Harga terendah: Rp ${minPrice.toLocaleString()}`);
console.log(`   - Skor harga ((${maxPrice} - ${hotel.max_harga}) / (${maxPrice} - ${minPrice})) = ${priceScore.toFixed(4)}`);
console.log(`   - Skor harga terbobot (${priceScore.toFixed(4)} × ${weights.bobot_harga}) = ${weightedPriceScore.toFixed(4)}`);

// Sisa perhitungan tetap sama ...
      // 3. Perhitungan Skor Fasilitas
const selectedFacilities = [];
if (req.body.ac === true) selectedFacilities.push('ac');
if (req.body.tv === true) selectedFacilities.push('tv');
if (req.body.wifi === true) selectedFacilities.push('wifi');
if (req.body.breakfast === true) selectedFacilities.push('breakfast');
if (req.body.pool === true) selectedFacilities.push('pool');
if (req.body.parking === true) selectedFacilities.push('parking');

console.log('DEBUG: Selected Facilities:', selectedFacilities);
console.log('DEBUG: Request Body:', req.body);

const facilityScores = {
  ac: hotel.ac ? 1 : 0,
  tv: hotel.tv ? 1 : 0,
  wifi: hotel.wifi ? 1 : 0,
  breakfast: hotel.breakfast ? 1 : 0,
  pool: hotel.pool ? 1 : 0,
  parking: hotel.parking ? 1 : 0
};

const selectedFacilitiesCount = selectedFacilities.length;

// Tambahkan variabel matchedFacilities
const matchedFacilities = selectedFacilitiesCount > 0 
  ? selectedFacilities.filter(facility => facilityScores[facility] === 1)
  : [];

console.log('DEBUG: Matched Facilities:', matchedFacilities);

let facilityScore = 0;
let weightedFacilityScore = 0;

// Logika perhitungan skor fasilitas yang baru
if (selectedFacilitiesCount === 0) {
  // Jika tidak ada fasilitas dipilih, skor 1
  facilityScore = 1;
} else {
  // Jika ada fasilitas yang dipilih
  if (matchedFacilities.length === 0) {
    // Tidak ada fasilitas yang cocok
    facilityScore = 0;
  } else {
    // Ada fasilitas yang cocok
    facilityScore = matchedFacilities.length / selectedFacilitiesCount;
  }
}

weightedFacilityScore = facilityScore * weights.bobot_fasilitas;

console.log('\n3. Perhitungan Skor Fasilitas:');
console.log(`   - Fasilitas yang dipilih: ${selectedFacilities.join(', ') || 'Tidak ada'}`);
console.log(`   - Fasilitas hotel yang cocok: ${matchedFacilities.join(', ') || 'Tidak ada'}`);
console.log(`   - Total fasilitas dipilih: ${selectedFacilitiesCount}`);
console.log(`   - Total fasilitas cocok: ${matchedFacilities.length}`);
console.log(`   - Skor fasilitas (${matchedFacilities.length}/${selectedFacilitiesCount}) = ${facilityScore.toFixed(4)}`);
console.log(`   - Skor fasilitas terbobot (${facilityScore.toFixed(4)} × ${weights.bobot_fasilitas}) = ${weightedFacilityScore.toFixed(4)}`);
      // 4. Perhitungan Skor Tipe Kamar
      let roomTypeScore = 0;
      let roomTypeDetails = {};

      if (req.body.room_types) {
        const roomTypeArray = req.body.room_types.split(',').map(type => type.trim().toLowerCase());
        if (hotel.type_kamar) {
          let hotelRoomTypes;
          try {
            hotelRoomTypes = JSON.parse(hotel.type_kamar);
          } catch (e) {
            hotelRoomTypes = hotel.type_kamar.split(',');
          }
          hotelRoomTypes = hotelRoomTypes.map(type => type.toLowerCase());

          const typeScores = {
            suite: 1.0,
            double: 0.7,
            single: 0.4
          };

          roomTypeArray.forEach(requestedType => {
            if (hotelRoomTypes.includes(requestedType)) {
              roomTypeScore = Math.max(roomTypeScore, typeScores[requestedType] || 0);
              roomTypeDetails[requestedType] = typeScores[requestedType];
            }
          });
        }
      }

      const weightedRoomTypeScore = roomTypeScore * weights.bobot_tipe_kamar;

      console.log('\n4. Perhitungan Skor Tipe Kamar:');
      Object.entries(roomTypeDetails).forEach(([type, score]) => {
        console.log(`   - ${type}: ${score}`);
      });
      console.log(`   - Skor tipe kamar tertinggi: ${roomTypeScore.toFixed(4)}`);
      console.log(`   - Skor tipe kamar terbobot (${roomTypeScore.toFixed(4)} × ${weights.bobot_tipe_kamar}) = ${weightedRoomTypeScore.toFixed(4)}`);

      // 5. Hitung Total Skor
      const totalScore = (
        weightedDistanceScore +
        weightedPriceScore +
        weightedFacilityScore +
        weightedRoomTypeScore
      ) / weights.total_bobot;

      console.log('\n5. Perhitungan Skor Total:');
      console.log(`   - Skor jarak terbobot: ${weightedDistanceScore.toFixed(4)}`);
      console.log(`   - Skor harga terbobot: ${weightedPriceScore.toFixed(4)}`);
      console.log(`   - Skor fasilitas terbobot: ${weightedFacilityScore.toFixed(4)}`);
      console.log(`   - Skor tipe kamar terbobot: ${weightedRoomTypeScore.toFixed(4)}`);
      console.log(`   - Total: (${weightedDistanceScore.toFixed(4)} + ${weightedPriceScore.toFixed(4)} + ${weightedFacilityScore.toFixed(4)} + ${weightedRoomTypeScore.toFixed(4)}) / ${weights.total_bobot} = ${totalScore.toFixed(4)}`);
      console.log('=================================================\n');

      return {
        ...hotel,
        calculations: {
          distanceScore,
          priceScore,
          facilityScore,
          roomTypeScore,
          totalScore,
          detail: {
            distance: {
              value: hotel.distance,
              maxValue: maxDistance,
              rawScore: distanceScore,
              weightedScore: weightedDistanceScore,
              weight: weights.bobot_jarak
            },
            price: {
              value: hotel.max_harga,
              maxValue: maxPrice,
              rawScore: priceScore,
              weightedScore: weightedPriceScore,
              weight: weights.bobot_harga
            },
            facilities: {
              scores: facilityScores,
              total: selectedFacilitiesCount, // Gunakan jumlah fasilitas yang dipilih
              maxValue: 6,
              rawScore: facilityScore,
              weightedScore: weightedFacilityScore,
              weight: weights.bobot_fasilitas
            },
            roomType: {
              scores: roomTypeDetails,
              rawScore: roomTypeScore,
              weightedScore: weightedRoomTypeScore,
              weight: weights.bobot_tipe_kamar
            }
          }
        }
      };
    });

    // Urutkan berdasarkan skor dan ambil 7 teratas
    const recommendations = hotelsWithScores
      .sort((a, b) => b.calculations.totalScore - a.calculations.totalScore)
      .slice(0, 7);

      console.log('\n=== Hasil Akhir Perangkingan ===');
      console.log('Total rekomendasi:', recommendations.length);
      recommendations.forEach((hotel, index) => {
        console.log(`\n${index + 1}. ${hotel.nama}`);
        console.log(`   - Jarak: ${hotel.distance.toFixed(2)} km`);
        console.log(`   - Harga: Rp ${hotel.max_harga.toLocaleString()}`);
        console.log(`   - Total Skor: ${hotel.calculations.totalScore.toFixed(4)}`);
        console.log(`   - Detail Skor:`);
        console.log(`     * Jarak: ${hotel.calculations.detail.distance.weightedScore.toFixed(4)}`);
        console.log(`     * Harga: ${hotel.calculations.detail.price.weightedScore.toFixed(4)}`);
        console.log(`     * Fasilitas: ${hotel.calculations.detail.facilities.weightedScore.toFixed(4)}`);
        console.log(`     * Tipe Kamar: ${hotel.calculations.detail.roomType.weightedScore.toFixed(4)}`);
      });
  
      res.json({
        error: false,
        message: recommendations.length > 0 ? 
          'Rekomendasi hotel berhasil didapatkan' : 
          'Tidak ada hotel yang sesuai dengan kriteria',
        data: recommendations,
        meta: {
          total_found: filteredHotels.length,
          shown: recommendations.length,
          max_distance: MAX_DISTANCE,
          search_radius: `${MAX_DISTANCE} KM`,
          weights: {
            jarak: weights.bobot_jarak,
            harga: weights.bobot_harga,
            fasilitas: weights.bobot_fasilitas,
            tipe_kamar: weights.bobot_tipe_kamar,
            total: weights.total_bobot
          },
          calculation_steps: {
            description: "Langkah perhitungan:",
            steps: [
              "1. Normalisasi jarak: 1 - (jarak_hotel / jarak_maksimal)",
              "2. Normalisasi harga: 1 - (harga_hotel / harga_maksimal)",
              "3. Skor fasilitas: jumlah_fasilitas_tersedia / total_fasilitas",
              "4. Skor tipe kamar: suite(1.0) / double(0.7) / single(0.4)",
              "5. Total: (bobot_jarak × skor_jarak + bobot_harga × skor_harga + " +
                       "bobot_fasilitas × skor_fasilitas + bobot_tipe_kamar × skor_tipe_kamar) / total_bobot"
            ]
          }
        }
      });
  
    } catch (error) {
      console.error('=== ERROR ===');
      console.error('Error detail:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({
        error: true,
        message: 'Gagal mendapatkan rekomendasi hotel: ' + error.message
      });
    }
  };