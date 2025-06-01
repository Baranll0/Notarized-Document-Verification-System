FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests
RUN ls -la /app/target/
RUN find /app/target -name "*.jar"

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar
RUN ls -la /app/
EXPOSE 8081 8082 8083
ENTRYPOINT ["java", "-jar", "app.jar"] 