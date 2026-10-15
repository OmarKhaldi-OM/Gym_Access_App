package com.example.gym_app.classes.service;

import com.example.gym_app.classes.dto.ClassScheduleRequestDTO;
import com.example.gym_app.classes.dto.ClassScheduleResponseDTO;
import com.example.gym_app.classes.entity.Class_Schedule;
import com.example.gym_app.classes.entity.Gym_Class;
import com.example.gym_app.classes.repository.ClassScheduleRepository;
import com.example.gym_app.classes.repository.GymClassRepository;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.TrainerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClassScheduleService {

    private final ClassScheduleRepository classScheduleRepository;

    private final GymClassRepository gymClassRepository;

    private final TrainerRepository trainerRepository;
    private final SecurityUtil securityUtil;

    public ClassScheduleService(
            ClassScheduleRepository classScheduleRepository,
            GymClassRepository gymClassRepository,
            TrainerRepository trainerRepository,
            SecurityUtil securityUtil) {
        this.classScheduleRepository = classScheduleRepository;
        this.gymClassRepository = gymClassRepository;
        this.trainerRepository = trainerRepository;
        this.securityUtil = securityUtil;
    }

    private ClassScheduleResponseDTO toDTO(Class_Schedule schedule) {
        ClassScheduleResponseDTO dto = new ClassScheduleResponseDTO();
        dto.setId(schedule.getId());
        dto.setClassId(schedule.getGymClass().getId());
        dto.setClassName(schedule.getGymClass().getNom());
        dto.setTrainerId(schedule.getTrainer().getId());
        dto.setTrainerNom(schedule.getTrainer().getNom());
        dto.setDateHeure(schedule.getDateHeure());
        dto.setDureeMin(schedule.getDureeMin());
        return dto;
    }

    public List<ClassScheduleResponseDTO> findAll() {
        return classScheduleRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ClassScheduleResponseDTO findById(UUID id) {
        Class_Schedule schedule = classScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassSchedule introuvable avec id: " + id));
        return toDTO(schedule);
    }

    public List<ClassScheduleResponseDTO> findByTrainer(UUID trainerId) {
        return classScheduleRepository.findByTrainerId(trainerId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ClassScheduleResponseDTO create(ClassScheduleRequestDTO dto) {
        securityUtil.requireStaff();
        Gym_Class gymClass = gymClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("GymClass introuvable avec id: " + dto.getClassId()));
        Trainer trainer = trainerRepository.findById(dto.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainer introuvable avec id: " + dto.getTrainerId()));

        LocalDateTime nouveauDebut = dto.getDateHeure();
        LocalDateTime nouveauFin = nouveauDebut.plusMinutes(dto.getDureeMin());

        List<Class_Schedule> planningExistant = classScheduleRepository.findByTrainerId(trainer.getId());

        boolean conflit = planningExistant.stream().anyMatch(existant -> {
            LocalDateTime debutExistant = existant.getDateHeure();
            LocalDateTime finExistant = debutExistant.plusMinutes(existant.getDureeMin());
            return nouveauDebut.isBefore(finExistant) && debutExistant.isBefore(nouveauFin);
        });

        if (conflit) {
            throw new ConflictException("Ce trainer a deja un cours programme sur ce creneau horaire");
        }

        Class_Schedule schedule = new Class_Schedule();
        schedule.setGymClass(gymClass);
        schedule.setTrainer(trainer);
        schedule.setDateHeure(dto.getDateHeure());
        schedule.setDureeMin(dto.getDureeMin());

        return toDTO(classScheduleRepository.save(schedule));
    }
    public ClassScheduleResponseDTO update(UUID id, ClassScheduleRequestDTO dto) {
        securityUtil.requireStaff();
        Class_Schedule existing = classScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassSchedule introuvable avec id: " + id));

        Gym_Class gymClass = gymClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("GymClass introuvable avec id: " + dto.getClassId()));
        Trainer trainer = trainerRepository.findById(dto.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainer introuvable avec id: " + dto.getTrainerId()));

        LocalDateTime nouveauDebut = dto.getDateHeure();
        LocalDateTime nouveauFin = nouveauDebut.plusMinutes(dto.getDureeMin());

        // Verifie les conflits d'horaire du trainer, en excluant la seance qu'on est en train de modifier
        List<Class_Schedule> planningExistant = classScheduleRepository.findByTrainerId(trainer.getId());
        boolean conflit = planningExistant.stream()
                .filter(s -> !s.getId().equals(id))
                .anyMatch(existant -> {
                    LocalDateTime debutExistant = existant.getDateHeure();
                    LocalDateTime finExistant = debutExistant.plusMinutes(existant.getDureeMin());
                    return nouveauDebut.isBefore(finExistant) && debutExistant.isBefore(nouveauFin);
                });

        if (conflit) {
            throw new ConflictException("Ce trainer a deja un cours programme sur ce creneau horaire");
        }

        existing.setGymClass(gymClass);
        existing.setTrainer(trainer);
        existing.setDateHeure(dto.getDateHeure());
        existing.setDureeMin(dto.getDureeMin());
        return toDTO(classScheduleRepository.save(existing));
    }

    public void delete(UUID id) {
        securityUtil.requireStaff();
        classScheduleRepository.deleteById(id);
    }
}
