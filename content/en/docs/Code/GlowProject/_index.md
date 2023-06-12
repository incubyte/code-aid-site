---
categories: [ "Examples", "Placeholders" ]
tags: [ "test","docs" ]
title: "GlowStone"
linkTitle: "GlowStone"
weight: -2
description: >
  What does your user need to know to try your project?
---

### Project Overview

This document provides a high-level overview of the key aspects of the project's codebase and its development practices.

{{<sectionHeadingWithTooltip "Our system identifies the version control system (VCS) being used by looking for specific files in the project root directory. These files include .git for Git, .svn for Subversion, .hg for Mercurial, p4config.txt for Perforce, and CVS for CVS. If none of these files are found, the VCS will be marked as unknown.">}}
Source Control
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Version control system (VCS) used: Git" >}}
checked
{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "Our system determines the build tool used by your project by looking for specific configuration files in the root directory. For instance, pom.xml indicates Maven, build.gradle or build.gradle.kts points to Gradle (with Kotlin in the latter case), package.json implies npm, and so forth. If none of these files are found, the build tool will be marked as unknown.">}}
Build Tools
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Build tools used: Gradle (Kotlin)" >}}
checked
{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "We determine the containerization tool your project uses by looking for specific configuration files in the root directory. For instance, any file with Dockerfile in the name suggests Docker, files with .lxc extension suggests LXC/LXD, Podfile indicates Podman, and so on. If none of these files are found, the containerization tool will be marked as unknown">}}
Containerization
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Containerization tool used: UNKNOWN" >}}

{{< /customCheckBox>}}{{<whyItMatters>}}
Containerization is the process of packaging an application along with its required environment, libraries, and dependencies, all bundled into one package or "container". This container can then be run consistently on any infrastructure, which provides advantages in terms of portability, consistency, and efficiency. Docker and Kubernetes are popular tools used for containerization.

- **Consistency:** Containerization ensures that your application runs the same way, every time, regardless of the environment. This eliminates the common problem of "it works on my machine".
- **Scalability:** Containerized applications are easy to scale. Just spin up a new container when you need more capacity.
- **Isolation:** Containers isolate your application and its dependencies from the rest of the system. This reduces conflicts between different parts of your system and increases security.

###### Quick Start:
Docker is the most popular tool for containerization. Get started by creating a Dockerfile to specify how your application should run. Learn more with the [Docker getting started guide](https://docs.docker.com/get-started/).
{{</whyItMatters>}}


{{<sectionHeadingWithTooltip "We identify the continuous integration and delivery (CI/CD) tool used in your project by searching for specific configuration files in the root directory. For example, a Jenkinsfile suggests Jenkins, .gitlab-ci.yml suggests GitLab CI, .travis.yml indicates Travis CI, and so on. If none of these files are found, the CI/CD tool will be listed as unknown">}}
Continuous Integration/Continuous Deployment (CI/CD)
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "CI/CD configuration present: GitHub Actions" >}}
checked
{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "This service looks for the presence of tests in your codebase by scanning for file patterns that typically denote tests. Common patterns include names containing 'Test', 'test', 'Spec', 'spec', 'Should', 'should' and so on. These patterns are sought in all directories of your project. If such files are detected, it indicates that your project likely has a testing mechanism in place.">}}
Testing
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Testing" >}}
checked
{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "We look for migration scripts in your project by searching for specific file patterns within your codebase. Common patterns include directories labeled 'migrations', 'Migrations', 'EFMigrations', or 'DbMigrations', and files with names ending in 'Migration' with various language-specific file extensions like '.java', '.py', '.rb', '.js', '.php', '.go', '.r', or '.cob'. If files matching these patterns are found, we consider that your project uses migration scripts">}}
Database Migrations
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Database migration scripts present" >}}

{{< /customCheckBox>}}{{<whyItMatters>}}
Database migration scripts are sets of commands that bring your database from one state to another. These scripts, often written in SQL or a similar database language, update the schema of your database or change the data within it. Migration scripts can be thought of as version control for your database, allowing you to update, rollback, and manage your database schema effectively. They are an integral part of database management and are widely used in software development.

- **Version Control:** Database migration scripts allow you to version control your database changes just like your application code. This is essential for consistency across environments.
- **Collaboration:** Migration scripts enable multiple developers to collaborate on database changes without overwriting each other's work.
- **Rollbacks:** In case of a problem, migration scripts allow you to roll back database changes to a previous state.

###### Quick Start:
Various database migration tools are available based on the technology you are using. For example, you could use Flyway or Liquibase for Java, FluentMigrator for .NET, or Alembic for Python. Read the documentation of your preferred tool to get started.
{{</whyItMatters>}}


{{<sectionHeadingWithTooltip "Our system searches for schema definitions within your project by looking for specific file patterns in your codebase. Common patterns include files with 'Schema', 'schema', 'model', 'Model', 'Entity' in their names. These patterns could exist at any level of your project directories. If files matching these patterns are detected, it signifies that your project likely has defined data schemas.">}}
Database Schema Documentation
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Database schema documentation present" >}}
checked
{{< /customCheckBox>}}




