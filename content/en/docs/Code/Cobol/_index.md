---
categories: ["Examples", "Placeholders"]
tags: ["test","docs"] 
title: "Cobol"
linkTitle: "Cobol"
weight: -2
description: >
  What does your user need to know to try your project?
---

### Project Overview

This document provides a high-level overview of the key aspects of the project's codebase and its development practices.

{{<sectionHeadingWithTooltip "Our system identifies the version control system (VCS) being used by looking for specific files in the project root directory. These files include .git for Git, .svn for Subversion, .hg for Mercurial, p4config.txt for Perforce, and CVS for CVS. If none of these files are found, the VCS will be marked as unknown.">}}
Source Control
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Version control system (VCS) used: UNKNOWN" >}}

{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "Our system determines the build tool used by your project by looking for specific configuration files in the root directory. For instance, pom.xml indicates Maven, build.gradle or build.gradle.kts points to Gradle (with Kotlin in the latter case), package.json implies npm, and so forth. If none of these files are found, the build tool will be marked as unknown.">}}
Build Tools
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Build tools used: UNKNOWN" >}}

{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "We determine the containerization tool your project uses by looking for specific configuration files in the root directory. For instance, any file with Dockerfile in the name suggests Docker, files with .lxc extension suggests LXC/LXD, Podfile indicates Podman, and so on. If none of these files are found, the containerization tool will be marked as unknown">}}
Containerization
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Containerization tool used: UNKNOWN" >}}

{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "We identify the continuous integration and delivery (CI/CD) tool used in your project by searching for specific configuration files in the root directory. For example, a Jenkinsfile suggests Jenkins, .gitlab-ci.yml suggests GitLab CI, .travis.yml indicates Travis CI, and so on. If none of these files are found, the CI/CD tool will be listed as unknown">}}
Continuous Integration/Continuous Deployment (CI/CD)
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "CI/CD configuration present: UNKNOWN" >}}

{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "This service looks for the presence of tests in your codebase by scanning for file patterns that typically denote tests. Common patterns include names containing 'Test', 'test', 'Spec', 'spec', 'Should', 'should' and so on. These patterns are sought in all directories of your project. If such files are detected, it indicates that your project likely has a testing mechanism in place.">}}
Testing
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Testing" >}}

{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "We look for migration scripts in your project by searching for specific file patterns within your codebase. Common patterns include directories labeled 'migrations', 'Migrations', 'EFMigrations', or 'DbMigrations', and files with names ending in 'Migration' with various language-specific file extensions like '.java', '.py', '.rb', '.js', '.php', '.go', '.r', or '.cob'. If files matching these patterns are found, we consider that your project uses migration scripts">}}
Database Migrations
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Database migration scripts present" >}}

{{< /customCheckBox>}}

{{<sectionHeadingWithTooltip "Our system searches for schema definitions within your project by looking for specific file patterns in your codebase. Common patterns include files with 'Schema', 'schema', 'model', 'Model', 'Entity' in their names. These patterns could exist at any level of your project directories. If files matching these patterns are detected, it signifies that your project likely has defined data schemas.">}}
Database Schema Documentation
{{</sectionHeadingWithTooltip>}}

{{< customCheckBox "Database schema documentation present" >}}

{{< /customCheckBox>}}





