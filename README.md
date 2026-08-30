# Urban Flood Intelligence — SIH26085

## Urban Flood Nowcasting System
### Drainage and Rainfall Coupling

A prototype decision-support system for street-level urban flood nowcasting using rainfall, terrain, surface runoff, drainage-network conditions, and flood-aware routing.

## Problem

Urban flooding is highly localized. Rainfall information alone cannot determine which streets will flood, how deep the water may become, or when flooding may occur.

SIH26085 requires a 0–3 hour urban flood nowcasting approach that couples rainfall, terrain, and drainage behaviour.

## Our Solution

Urban Flood Intelligence combines:

- Rainfall nowcast/simulation
- DEM and terrain analysis
- Surface runoff estimation
- Stormwater drainage network modelling
- Drainage capacity and blockage analysis
- Street-level flood risk prediction
- Water-depth estimation
- 0–3 hour flood forecast
- Explainable risk factors
- Flood-safe emergency routing
- Critical infrastructure monitoring
- What-If Digital Twin simulation
- Automated decision-support alerts

## Core Workflow

Rainfall
→ Runoff
→ Terrain
→ Drainage Network
→ Hydraulic Capacity
→ Flood Prediction
→ Water Depth + Risk + ETA
→ Safe Routing

## Key Features

### 0–3 Hour Nowcasting
Visualize predicted flood conditions over the next three hours.

### Street-Level Intelligence
Inspect individual roads for predicted depth, probability, ETA, drainage load and risk factors.

### Drainage Intelligence
Identify overloaded and vulnerable drainage nodes and evaluate the effect of blockage.

### What-If Simulation
Test how increased rainfall or drainage blockage changes flood conditions.

### Flood-Safe Routing
Generate safer routes by considering predicted flood risk.

### Critical Infrastructure
Monitor hospitals, emergency facilities and other important locations.

## Prototype Status

This is a demonstration prototype developed for Smart India Hackathon 2026 Problem Statement SIH26085.

The current prototype uses simulation/demo data where live municipal or radar feeds are not available. The architecture is designed to support integration with real rainfall, DEM and drainage datasets.

## Technology

- Next.js
- TypeScript
- React
- GIS / Interactive Mapping
- Python / Data Processing
- Geospatial Processing
- Graph-based Drainage Modelling
- Machine Learning
- OpenStreetMap-based Routing

## Problem Statement

**SIH26085 — Urban Flood Nowcasting System (Drainage and Rainfall Coupling)**

Organization: Ministry of Earth Sciences (MoES)  
Department: National Centre for Medium Range Weather Forecasting (NCMRWF)  
Theme: Disaster Management  
Category: Software
