<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Dynamic Question Assignment System Design

## Project setup

```bash
$ npm install
```

## Create and setup your environment variables in a `.env` file in the root directory

```bash
// Postgres
DB_HOST=localhost
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

// Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

---

## Overview

This document outlines the architecture, design choices, and implementation details of a dynamic question assignment system. The goal of this system is to assign questions to users based on their region and an active cycle schedule. I have designed the system to handle requirements such as configurable cycles, region-specific question assignments, scalability for high user loads, and efficient caching. 

### System Requirements and Objectives

1. **Dynamic Assignment:** Questions are stored in a database and are assigned per cycle. 
2. **Region-specific Assignments:** Each region (e.g., Singapore, the US) receives a unique set of questions. Users in the same region receive the same questions per cycle, while users in different regions receive distinct questions.
3. **Configurability:** The cycle duration is adjustable, allowing administrators to define when questions rotate for each region.

---

## System Architecture and Design

To achieve the objectives, I used NestJS. Here’s a breakdown of the data model, system modules, and design details.

### Data Model

1. **Questions:** 
   - Questions are region-specific, meaning they are pre-associated with a region upon creation.
2. **Cycles:** 
   - Represent time periods with start and end dates. Each cycle duration can be customized, typically set to 7 days, and defines the rotation frequency for questions.
3. **Regions:** 
   - Represents geographical areas (e.g., Singapore, the US) with specific question sets. Each region will have unique assignments for each cycle.
4. **Assignments:** 
   - A relational table that links questions to regions and cycles. This enables tracking which question is assigned to which region during a specific cycle.

### Modular System Design

Using NestJS, the system is organized into highly modular components to enhance maintainability and scalability. Each module is responsible for distinct operations and functionality within the system:

1. **Questions Module:** 
   - Manages question data, including storage, retrieval, and metadata.
2. **Cycles Module:** 
   - Handles the creation, modification, and retrieval of cycles. It also includes methods for calculating the active cycle.
3. **Regions Module:** 
   - Manages data related to each region and maintains the relationship between regions and questions.
4. **Assignment Module:** 
   - Oversees the question assignment logic, determining which questions are assigned to each region during a given cycle.
5. **Cache Module:**
   - Utilizes Redis to cache frequently accessed data, particularly active question assignments, to improve efficiency and reduce database load.

### Key Technologies and Justification

1. **NestJS:** Selected for its support for TypeScript, dependency injection, and modularity.
2. **PostgreSQL and TypeORM:** PostgreSQL has robust transactional support. TypeORM simplifies data modeling with support for TypeScript.
3. **Redis:** Redis provides in-memory caching, enabling rapid access to frequently accessed data. This improves system efficiency by reducing the load on the main database, which is especially useful for caching active assignments during cycles.

---

## How the System Works

### 1. Cycle Management (CyclesService)

- **Objective:** Determine the currently active cycle based on configurable start and end dates and ensure that questions are rotated only within this active cycle.
- **Implementation in `getActiveCycle`:**
   - The system checks the database for a cycle with:
     - A `startDate` that is on or before the current date.
     - An end date calculated as `startDate + durationInDays` that includes the current date.
     - An active status set to `true`.
   - **Expected Output:** Returns the most recent cycle matching these criteria.

### 2. Question Assignment (QuestionRotationJob)

- **Objective:** Automatically assign questions to each region at the beginning of each cycle.
- **Scheduling:** A Cron job is configured to run every Monday at 7 PM SGT (or triggered manually if needed), which initiates the `handleQuestionRotation` method to handle the assignment.

- **Process in `handleQuestionRotation`:**
  1. **Retrieve All Regions:** The system fetches all regions using `regionsService.findAll()`.
  2. **Identify Active Cycle:** Using `cyclesService.getActiveCycle()`, the system retrieves the active cycle. If no active cycle is found, the job stops, and a `NotFoundException` is logged.
  3. **Assign Questions to Each Region:** For each region, `getNextQuestionForRegion` determines the next question to be assigned.
  4. **Create or Update Assignments:** The system uses `assignmentsService.createOrUpdateAssignment` to record the assignment for each region.
  5. **Cache the Assignment:** The assignment is stored in Redis using `cacheService` with a TTL (Time to Live) that matches the cycle’s duration, ensuring quick access during the cycle period.

### 3. Caching and Quick Access with Redis

- **Objective:** To enhance efficiency by caching active assignments in Redis, allowing users to retrieve assignments quickly without database access.
- **Implementation:** The `cacheService.setAssignment` method stores the active assignment in Redis with a TTL equal to the cycle duration. This cached data is accessible throughout the cycle, improving response times and reducing database load.

---

## System Setup and API Endpoints

The following steps outline the setup process for defining regions, cycles, and questions, as well as key API endpoints to test the core system functionality. While additional endpoints are available in each module’s controllers for managing records, retrieving data, or updating configurations, these endpoints are essential for testing the primary functionality of the question rotation system.

### Step 1: Set Up Regions
- **Create Regions:** 
  Define different geographical areas as regions, each of which will have specific questions assigned per cycle.
   ```bash
   curl -X POST http://localhost:3000/regions -H "Content-Type: application/json" -d '{
     "name": "Singapore",
     "timezone": "Asia/Singapore"
   }'
   ```
   ```bash
   curl -X POST http://localhost:3000/regions -H "Content-Type: application/json" -d '{
     "name": "United States",
     "timezone": "America/New_York"
   }'
   ```   

### Step 2: Set Up Cycle
- **Create a Cycle:** 
  - Define the start date, duration, and status of the cycle. Ensure that the `startDate` is before or equal to the current date so that it can immediately be considered an active cycle if `active` is set to `true`.
   ```bash
   curl -X POST http://localhost:3000/cycles -H "Content-Type: application/json" -d '{
     "startDate": "2024-10-27T00:28:00+08:00",
     "durationInDays": 7,
     "active": true
   }'
   ```

### Step 3: Set Up Questions
- **Create Questions for the Regions:** 
  - Define questions that will be assigned to users in each region. Each question is linked to a specific `regionId` upon creation.
   ```bash
   curl -X POST http://localhost:3000/questions -H "Content-Type: application/json" -d '{
     "content": "What is the capital of Singapore?",
     "regionId": 1
   }'
   ```
   ```bash
   curl -X POST http://localhost:3000/questions -H "Content-Type: application/json" -d '{
     "content": "What is the largest city in Singapore?",
     "regionId": 1
   }'
   ```
   ```bash
   curl -X POST http://localhost:3000/questions -H "Content-Type: application/json" -d '{
     "content": "What is the capital of United States?",
     "regionId": 2
   }'
   ```
   ```bash
   curl -X POST http://localhost:3000/questions -H "Content-Type: application/json" -d '{
     "content": "What is the largest city in United States?",
     "regionId": 2
   }'
   ```

### Step 4: Trigger Question Rotation Manually
- **Manual Question Rotation Trigger:** 
  - This endpoint manually triggers the question rotation process, assigning the next question to each region according to the active cycle. Typically, this would be handled automatically by a scheduled Cron job, but the endpoint is useful for testing or re-triggering assignments.
   ```bash
   curl -X POST http://localhost:3000/trigger-rotation
   ```

### Step 5: Retrieve and Verify Assignments
- **Retrieve Current Question Assignment for a Region and Cycle:** 
  - This endpoint allows retrieval of the current question assigned to a specific region and cycle, utilizing cached assignments if available. It verifies that the question assignment system is functioning as expected.
   ```bash
   curl -X GET http://localhost:3000/assignments/1/1
   ```

---

## Pros and Cons of My Design

**Pros:**
- **Scalability and Performance:** The combination of Redis caching, Cron jobs, and a well-organized design makes the system capable of handling a high volume of users efficiently. 
- **Modularity:** The separation of concerns into distinct modules (e.g., Questions, Cycles, Regions, Assignments, and Cache) promotes a clean architecture that is easier to maintain and extend. This modularity ensures that individual components can be updated, tested, or replaced with minimal impact on the rest of the system.
- **Flexibility and Configurability:** The modular design and adjustable cycle duration allow the platform to adapt to various training and educational contexts. New regions, cycles, or question sets can be added without restructuring the entire system, and the cycle duration can be configured to fit different rotation schedules.

**Cons:**
- **Complexity:** The system’s architecture, while robust, can be complex to manage and requires careful handling, particularly with cache invalidation and scheduled tasks.
- **Dependency on Redis:** While caching improves efficiency, it introduces a dependency on Redis for performance. Issues with Redis could impact response times if not managed properly.

---

This design achieves a balance between operational efficiency, configurability, and performance, supporting long-term scalability and flexibility in a production environment.