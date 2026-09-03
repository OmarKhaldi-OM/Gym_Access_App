package com.example.gym_app.classes.service;

import com.example.gym_app.classes.dto.GymClassRequestDTO;
import com.example.gym_app.classes.dto.GymClassResponseDTO;
import com.example.gym_app.classes.entity.Gym_Class;
import com.example.gym_app.classes.repository.GymClassRepository;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GymClassService {

    @Autowired
    private GymClassRepository gymClassRepository;

    private GymClassResponseDTO toDTO(Gym_Class gymClass) {
        GymClassResponseDTO dto = new GymClassResponseDTO();
        dto.setId(gymClass.getId());
        dto.setNom(gymClass.getNom());
        dto.setDescription(gymClass.getDescription());
        dto.setCapaciteMax(gymClass.getCapaciteMax());
        return dto;
    }

    private Gym_Class toEntity(GymClassRequestDTO dto) {
        Gym_Class gymClass = new Gym_Class();
        gymClass.setNom(dto.getNom());
        gymClass.setDescription(dto.getDescription());
        gymClass.setCapaciteMax(dto.getCapaciteMax());
        return gymClass;
    }

    public List<GymClassResponseDTO> findAll() {
        return gymClassRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public GymClassResponseDTO findById(UUID id) {
        Gym_Class gymClass = gymClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GymClass introuvable avec id: " + id));
        return toDTO(gymClass);
    }

    // Empeche la creation de deux classes avec le meme nom
    public GymClassResponseDTO create(GymClassRequestDTO dto) {
        if (gymClassRepository.existsByNom(dto.getNom())) {
            throw new ConflictException("Une classe avec ce nom existe deja");
        }
        return toDTO(gymClassRepository.save(toEntity(dto)));
    }

    public GymClassResponseDTO update(UUID id, GymClassRequestDTO dto) {
        Gym_Class existing = gymClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GymClass introuvable avec id: " + id));

        // Si le nom change, verifie qu'il n'entre pas en conflit avec une autre classe existante
        if (!existing.getNom().equals(dto.getNom()) && gymClassRepository.existsByNom(dto.getNom())) {
            throw new  ConflictException("Une classe avec ce nom existe deja");
        }

        existing.setNom(dto.getNom());
        existing.setDescription(dto.getDescription());
        existing.setCapaciteMax(dto.getCapaciteMax());
        return toDTO(gymClassRepository.save(existing));
    }

    public void delete(UUID id) {
        gymClassRepository.deleteById(id);
    }
}
