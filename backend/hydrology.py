"""
Hydrologic nowcasting calculations using Rational Method and Surcharge Hydraulics
"""

import math
from typing import Dict, Any, Tuple

# Land cover runoff coefficients (Rational Method)
RUNOFF_COEFFICIENTS = {
    "concrete": 0.90,
    "asphalt": 0.85,
    "roof": 0.95,
    "soil": 0.35,
    "parks": 0.25,
    "water_body": 1.00
}

def calculate_rational_peak_discharge(rainfall_mm_hr: float, area_sq_m: float, runoff_coeff: float = 0.88) -> Tuple[float, float]:
    """
    Computes peak discharge Q (m^3/s) and volume V (m^3)
    Q = 0.278 * C * I * A (with A in km^2, I in mm/hr)
    """
    area_km2 = area_sq_m / 1_000_000.0
    peak_discharge_m3s = 0.278 * runoff_coeff * rainfall_mm_hr * area_km2
    rainfall_meters = rainfall_mm_hr / 1000.0
    runoff_volume_m3 = rainfall_meters * area_sq_m * runoff_coeff
    return peak_discharge_m3s, runoff_volume_m3

def compute_street_ponding(
    rainfall_mm_hr: float,
    catchment_area_sq_m: float,
    drain_capacity_m3s: float,
    blockage_pct: float,
    elevation_msl: float,
    road_length_m: float,
    road_width_m: float,
    duration_min: int = 60
) -> Dict[str, Any]:
    """
    Coupled surface runoff + subsurface pipe bottleneck calculation
    """
    peak_discharge, runoff_volume = calculate_rational_peak_discharge(rainfall_mm_hr, catchment_area_sq_m)
    
    # Effective inlet capacity after silt/trash obstruction
    effective_drain_capacity = drain_capacity_m3s * max(0.05, 1.0 - (blockage_pct / 100.0))
    excess_rate = max(0.0, peak_discharge - effective_drain_capacity)

    # Surface volume retention factoring street curb storage
    road_area_sq_m = road_length_m * road_width_m
    surface_volume = excess_rate * (duration_min * 60) * 0.45

    # Depth in centimeters
    depth_cm = (surface_volume / road_area_sq_m) * 100.0

    # Low terrain depression multiplier (e.g. underpasses)
    if elevation_msl < 4.0:
        depth_cm *= 1.35
    elif elevation_msl < 5.5:
        depth_cm *= 1.15

    depth_cm = round(min(depth_cm, 120.0), 1)

    # Risk level classification
    if depth_cm <= 5:
        risk = "NORMAL"
    elif depth_cm <= 15:
        risk = "WATCH"
    elif depth_cm <= 30:
        risk = "WARNING"
    elif depth_cm <= 60:
        risk = "SEVERE"
    else:
        risk = "CRITICAL"

    recovery_time_min = round(depth_cm * 2.2 + 20)

    return {
        "runoff_volume_m3": round(runoff_volume, 1),
        "peak_discharge_m3s": round(peak_discharge, 2),
        "effective_drain_capacity_m3s": round(effective_drain_capacity, 2),
        "excess_rate_m3s": round(excess_rate, 2),
        "flood_depth_cm": depth_cm,
        "risk_level": risk,
        "recovery_time_min": recovery_time_min
    }
