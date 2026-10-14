package com.example.gym_app.user.entity;

import com.example.gym_app.access.entity.Access_Log;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "staff")
@Getter
@Setter
@NoArgsConstructor
public class Staff extends User {

    @Column(name = "date_embauche")
    private LocalDate dateEmbauche;

    @OneToMany(mappedBy = "staff")
    private List<Access_Log> validatedAccessLogs;
}