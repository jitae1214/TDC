package com.yhk.webchat.chat_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.annotation.Order;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * 데이터베이스 마이그레이션 설정
 */
@Configuration
public class DatabaseMigrationConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationConfig.class);
    
    private final DataSource dataSource;
    
    public DatabaseMigrationConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * 애플리케이션 시작 시 파일 메시지 지원을 위한 스키마 업데이트
     */
    @Bean
    @Order(1) // 다른 초기화보다 먼저 실행
    public CommandLineRunner migrateFileMessageSchema() {
        return args -> {
            logger.info("파일 메시지 스키마 업데이트 시작");
            try (Connection connection = dataSource.getConnection()) {
                // 현재 데이터베이스 타입 확인
                String databaseType = connection.getMetaData().getDatabaseProductName().toLowerCase();
                logger.info("데이터베이스 타입: {}", databaseType);
                
                // 파일 컬럼 추가
                addFileColumnsIfNotExist(connection, databaseType);
                
                // H2, MySQL, PostgreSQL에 따라 다른 처리
                if (databaseType.contains("h2")) {
                    logger.info("H2 데이터베이스는 별도의 ENUM 처리가 필요하지 않습니다.");
                } 
                else if (databaseType.contains("postgresql")) {
                    logger.info("PostgreSQL에서 ENUM 타입 업데이트 시도");
                    updatePostgresEnum(connection);
                } 
                else if (databaseType.contains("mysql") || databaseType.contains("mariadb")) {
                    logger.info("MySQL/MariaDB는 ENUM 처리가 별도로 필요하지 않습니다.");
                }
                
                logger.info("파일 메시지 스키마 업데이트 완료");
            } catch (Exception e) {
                logger.error("파일 메시지 스키마 업데이트 중 오류 발생: {}", e.getMessage(), e);
                // 애플리케이션 시작은 계속 진행
            }
        };
    }
    
    /**
     * chat_messages 테이블에 파일 관련 컬럼 추가
     */
    private void addFileColumnsIfNotExist(Connection connection, String databaseType) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        String tableName = databaseType.contains("postgres") ? "chat_messages" : "CHAT_MESSAGES";
        String columnName = databaseType.contains("postgres") ? "file_url" : "FILE_URL";
        
        ResultSet columns = metaData.getColumns(null, null, tableName, columnName);
        
        if (!columns.next()) {
            logger.info("파일 관련 컬럼을 추가합니다.");
            try (Statement stmt = connection.createStatement()) {
                if (databaseType.contains("postgres")) {
                    // PostgreSQL용 SQL
                    stmt.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_url VARCHAR(500)");
                    stmt.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)");
                    stmt.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_type VARCHAR(100)");
                    stmt.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_size BIGINT");
                } else {
                    // H2, MySQL용 SQL
                    stmt.execute("ALTER TABLE CHAT_MESSAGES ADD COLUMN IF NOT EXISTS FILE_URL VARCHAR(500)");
                    stmt.execute("ALTER TABLE CHAT_MESSAGES ADD COLUMN IF NOT EXISTS FILE_NAME VARCHAR(255)");
                    stmt.execute("ALTER TABLE CHAT_MESSAGES ADD COLUMN IF NOT EXISTS FILE_TYPE VARCHAR(100)");
                    stmt.execute("ALTER TABLE CHAT_MESSAGES ADD COLUMN IF NOT EXISTS FILE_SIZE BIGINT");
                }
            }
        } else {
            logger.info("파일 관련 컬럼이 이미 존재합니다.");
        }
    }
    
    /**
     * PostgreSQL에서 messagetype ENUM에 FILE 값 추가
     */
    private void updatePostgresEnum(Connection connection) {
        try {
            // enum 타입이 존재하는지 먼저 확인
            try (Statement stmt = connection.createStatement()) {
                String checkTypeExistsSql = "SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'messagetype')";
                ResultSet rs = stmt.executeQuery(checkTypeExistsSql);
                boolean typeExists = false;
                if (rs.next()) {
                    typeExists = rs.getBoolean(1);
                }
                
                if (!typeExists) {
                    logger.info("messagetype ENUM이 존재하지 않습니다.");
                    return;
                }
                
                // enum 값이 이미 존재하는지 확인
                String checkValueExistsSql = "SELECT EXISTS(" +
                    "SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid " +
                    "WHERE t.typname = 'messagetype' AND e.enumlabel = 'FILE')";
                rs = stmt.executeQuery(checkValueExistsSql);
                boolean hasFileValue = false;
                if (rs.next()) {
                    hasFileValue = rs.getBoolean(1);
                }
                
                // FILE 값이 없으면 추가
                if (!hasFileValue) {
                    logger.info("messagetype ENUM에 FILE 값 추가 시도");
                    try {
                        stmt.execute("ALTER TYPE messagetype ADD VALUE 'FILE'");
                        logger.info("messagetype ENUM에 FILE 값 추가 성공");
                    } catch (Exception e) {
                        logger.warn("FILE 값 추가 시도 중 오류: {}. 이미 값이 존재하거나 다른 문제가 있을 수 있습니다.", e.getMessage());
                    }
                } else {
                    logger.info("messagetype ENUM에 FILE 값이 이미 존재합니다.");
                }
            }
        } catch (Exception e) {
            logger.warn("PostgreSQL ENUM 타입 처리 중 오류: {}. 이는 정상일 수 있습니다.", e.getMessage());
        }
    }
} 