/**
 * Medications & Equipment — Print / Export Utilities
 *
 * This module provides data shaping for print and PDF export of the
 * Medications, Equipment, and Pharmacies sections. Designed to produce
 * a clean emergency health summary.
 *
 * TODO: Integrate with the full report/PDF generation system when ready.
 */

import { FormData } from './FormContext';

export interface MedicationPrintRow {
  name: string;
  dosage: string;
  frequency: string;
  prescribingMD: string;
  pharmacy: string;
  rxNumber: string;
  condition: string;
}

export interface EquipmentPrintRow {
  item: string;
  type: string;
  supplierPhone: string;
  serialNumber: string;
  nextServiceDate: string;
}

export interface PharmacyPrintRow {
  name: string;
  phone: string;
  address: string;
  accountNumber: string;
}

export function getMedicationPrintData(formData: FormData): MedicationPrintRow[] {
  return (formData.medications || [])
    .filter((m) => m.isActive)
    .sort((a, b) => a.medicationName.localeCompare(b.medicationName))
    .map((m) => {
      const pharmacy = m.pharmacyIndex !== null
        ? (formData.pharmacies || [])[m.pharmacyIndex]
        : null;
      return {
        name: m.medicationName,
        dosage: m.dosage,
        frequency: m.frequency,
        prescribingMD: m.prescribingPhysician,
        pharmacy: pharmacy ? pharmacy.pharmacyName : '',
        rxNumber: m.rxNumber,
        condition: m.conditionTreated,
      };
    });
}

export function getEquipmentPrintData(formData: FormData): EquipmentPrintRow[] {
  return (formData.medicalEquipment || [])
    .filter((e) => e.isActive)
    .map((e) => ({
      item: e.equipmentName,
      type: e.equipmentType,
      supplierPhone: e.supplierPhone,
      serialNumber: e.serialNumber,
      nextServiceDate: e.nextServiceDate,
    }));
}

export function getPharmacyPrintData(formData: FormData): PharmacyPrintRow[] {
  return (formData.pharmacies || [])
    .filter((p) => p.isActive)
    .map((p) => ({
      name: p.pharmacyName,
      phone: p.phone,
      address: [p.address, p.city, p.state, p.zip].filter(Boolean).join(', '),
      accountNumber: p.accountNumber,
    }));
}
