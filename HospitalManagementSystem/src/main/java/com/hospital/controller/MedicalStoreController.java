package com.hospital.controller;

import com.hospital.entity.MedicalStore;
import com.hospital.service.MedicalStoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
public class MedicalStoreController {

    private final MedicalStoreService service;

    public MedicalStoreController(MedicalStoreService service) {
        this.service = service;
    }

    // All stores — admin only
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT','RECEPTIONIST')")
    public List<MedicalStore> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT','RECEPTIONIST')")
    public MedicalStore getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Nearby stores — any authenticated user
    @GetMapping("/nearby")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "50") double radius) {
        return service.findNearby(lat, lng, radius);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public MedicalStore create(@Valid @RequestBody MedicalStore store) {
        return service.create(store);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MedicalStore update(@PathVariable Long id, @Valid @RequestBody MedicalStore store) {
        return service.update(id, store);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}