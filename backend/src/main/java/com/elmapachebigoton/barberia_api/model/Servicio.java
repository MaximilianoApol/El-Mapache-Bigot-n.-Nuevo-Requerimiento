package com.elmapachebigoton.barberia_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "servicio")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(nullable = false)
    private Double costo;

    @Column(nullable = false)
    private String imagenUrl;
}
