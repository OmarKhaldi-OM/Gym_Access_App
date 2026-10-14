package com.example.gym_app.security;

import com.example.gym_app.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class ProfilePhotoStorageService {
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    private final Path directory;

    public ProfilePhotoStorageService(@Value("${app.upload-dir:uploads/profile-photos}") String uploadDirectory) {
        directory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        String contentType = file.getContentType();
        String extension = EXTENSIONS.get(contentType);
        if (file.isEmpty() || extension == null) {
            throw new BadRequestException("Choisissez une image JPEG, PNG, WebP ou GIF");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("La photo ne doit pas depasser 5 Mo");
        }

        String filename = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(directory);
            Files.copy(file.getInputStream(), pathFor(filename), StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible d'enregistrer la photo de profil", exception);
        }
    }

    public Path pathFor(String filename) {
        Path path = directory.resolve(filename).normalize();
        if (!path.startsWith(directory)) throw new BadRequestException("Nom de fichier invalide");
        return path;
    }

    public void delete(String filename) {
        if (filename == null || filename.isBlank()) return;
        try {
            Files.deleteIfExists(pathFor(filename));
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de supprimer l'ancienne photo", exception);
        }
    }

    public MediaType mediaType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        return switch (extension) {
            case ".jpg", ".jpeg" -> MediaType.IMAGE_JPEG;
            case ".png" -> MediaType.IMAGE_PNG;
            case ".webp" -> MediaType.parseMediaType("image/webp");
            case ".gif" -> MediaType.IMAGE_GIF;
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}