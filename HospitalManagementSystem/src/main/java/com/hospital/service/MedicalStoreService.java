package com.hospital.service;

import com.hospital.entity.MedicalStore;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.MedicalStoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MedicalStoreService {

    private final MedicalStoreRepository repository;

    public MedicalStoreService(MedicalStoreRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<MedicalStore> getAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public MedicalStore getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + id));
    }

    @Transactional
    public MedicalStore create(MedicalStore store) {
        return repository.save(store);
    }

    @Transactional
    public MedicalStore update(Long id, MedicalStore input) {
        MedicalStore s = getById(id);
        s.setName(input.getName());
        s.setCity(input.getCity());
        s.setAddress(input.getAddress());
        s.setPhone(input.getPhone());
        s.setLatitude(input.getLatitude());
        s.setLongitude(input.getLongitude());
        s.setOpeningHours(input.getOpeningHours());
        s.setHas24Hours(input.getHas24Hours());
        s.setIsActive(input.getIsActive());
        return repository.save(s);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getById(id));
    }

    /**
     * Finds stores near a given (lat, lng) within radiusKm.
     * Returns each store along with its distance in km, sorted by distance.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findNearby(double lat, double lng, double radiusKm) {
        return repository.findByIsActiveTrue().stream()
            .map(store -> {
                double dist = haversine(lat, lng, store.getLatitude(), store.getLongitude());
                Map<String, Object> row = new HashMap<>();
                row.put("store", store);
                row.put("distanceKm", Math.round(dist * 100.0) / 100.0);
                return row;
            })
            .filter(row -> (Double) row.get("distanceKm") <= radiusKm)
            .sorted(Comparator.comparingDouble(row -> (Double) row.get("distanceKm")))
            .collect(Collectors.toList());
    }

    /** Haversine distance in kilometers. */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}