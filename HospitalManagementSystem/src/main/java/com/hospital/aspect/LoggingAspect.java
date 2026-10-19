package com.hospital.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* com.hospital.controller..*(..)) || execution(* com.hospital.service..*(..))")
    public Object logExecution(ProceedingJoinPoint joinPoint) throws Throwable {

        String method = joinPoint.getSignature().toShortString();

        // Skip logging for authentication to avoid exposing usernames/passwords
        if (method.contains("AuthController") || method.contains("UserService")) {
            return joinPoint.proceed();
        }

        long start = System.currentTimeMillis();
        log.info("[START] {}", method);

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            log.info("[SUCCESS] {} completed in {} ms", method, duration);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("[FAILURE] {} failed after {} ms | Reason: {}",
                    method, duration, ex.getMessage());
            throw ex;
        }
    }
}