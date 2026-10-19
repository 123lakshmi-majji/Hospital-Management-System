package com.hospital.exception;

public class AppointmentConflictException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AppointmentConflictException(String message) {
        super(message);
    }
}