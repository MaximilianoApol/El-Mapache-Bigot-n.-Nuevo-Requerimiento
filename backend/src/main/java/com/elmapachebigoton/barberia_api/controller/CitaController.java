
package com.elmapachebigoton.barberia_api.controller;

import com.elmapachebigoton.barberia_api.model.Cita;
import com.elmapachebigoton.barberia_api.repository.CitaRepository;
import com.elmapachebigoton.barberia_api.repository.ClienteRepository;
import com.elmapachebigoton.barberia_api.repository.BarberoRepository;
import com.elmapachebigoton.barberia_api.repository.ServicioRepository;
import com.elmapachebigoton.barberia_api.repository.SucursalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private BarberoRepository barberoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @GetMapping
    public ResponseEntity<Iterable<Cita>> findAll() {
        return ResponseEntity.ok(citaRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> findById(@PathVariable Integer id) {
        Optional<Cita> cita = citaRepository.findById(id);
        return cita.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cita> create(@RequestBody Cita cita, UriComponentsBuilder uriBuilder) {
        if (!clienteRepository.findById(cita.getCliente().getId()).isPresent()
                || !barberoRepository.findById(cita.getBarbero().getId()).isPresent()
                || !servicioRepository.findById(cita.getServicio().getId()).isPresent()
                || !sucursalRepository.findById(cita.getSucursal().getId()).isPresent()) {
            return ResponseEntity.unprocessableEntity().build();
        }

        Cita created = citaRepository.save(cita);
        URI uri = uriBuilder.path("/citas/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Integer id, @RequestBody Cita cita) {
        if (!citaRepository.findById(id).isPresent()
                || !clienteRepository.findById(cita.getCliente().getId()).isPresent()
                || !barberoRepository.findById(cita.getBarbero().getId()).isPresent()
                || !servicioRepository.findById(cita.getServicio().getId()).isPresent()
                || !sucursalRepository.findById(cita.getSucursal().getId()).isPresent()) {
            return ResponseEntity.unprocessableEntity().build();
        }

        cita.setId(id);
        citaRepository.save(cita);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!citaRepository.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        citaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}