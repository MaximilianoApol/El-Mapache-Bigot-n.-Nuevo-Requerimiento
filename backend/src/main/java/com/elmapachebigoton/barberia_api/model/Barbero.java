package com.elmapachebigoton.barberia_api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "barbero")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Barbero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private String fotoUrl;
}
