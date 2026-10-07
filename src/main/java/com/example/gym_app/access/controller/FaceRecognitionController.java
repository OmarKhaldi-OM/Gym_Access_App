package com.example.gym_app.access.controller;

import com.example.gym_app.access.dto.FaceEnrollmentRequestDTO;
import com.example.gym_app.access.dto.FaceRecognitionRequestDTO;
import com.example.gym_app.access.dto.FaceRecognitionResponseDTO;
import com.example.gym_app.access.service.FaceRecognitionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/face-recognition")
@CrossOrigin(origins = "http://localhost:5173")
public class FaceRecognitionController {

    @Autowired
    private FaceRecognitionService faceRecognitionService;

    @PostMapping("/enroll")
    public ResponseEntity<FaceRecognitionResponseDTO> enroll(@Valid @RequestBody FaceEnrollmentRequestDTO dto) {
        return ResponseEntity.ok(faceRecognitionService.enroll(dto.getMemberId(), dto.getImageBase64()));
    }

    @PostMapping("/recognize")
    public ResponseEntity<FaceRecognitionResponseDTO> recognize(@Valid @RequestBody FaceRecognitionRequestDTO dto) {
        return ResponseEntity.ok(faceRecognitionService.recognize(dto.getImageBase64(), dto.getTypeAcces()));
    }
}
