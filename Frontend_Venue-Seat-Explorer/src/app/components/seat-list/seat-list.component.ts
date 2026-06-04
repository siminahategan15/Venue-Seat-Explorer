import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SeatService } from 'src/app/services/seat.service';
import { SectionService } from 'src/app/services/section.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Section } from 'src/app/models';

interface SeatPosition {
  seat: any;
  x: number;
  y: number;
  sectionId: string;
  color: string;
}

interface SectionLabel {
  x: number;
  y: number;
  name: string;
  sectionId: string;
}

type LayoutType = 'semicircle' | 'full-circle' | 'rectangle' | 'horseshoe';

@Component({
  selector: 'app-seat-list',
  templateUrl: './seat-list.component.html',
  styleUrls: ['./seat-list.component.css'],
})
export class SeatListComponent implements OnInit {
  @Input() venueId!: string;
  @Input() isAdmin = false;
  @Input() layout: LayoutType = 'semicircle';
  @ViewChild('seatDetailSection') seatDetailSection!: ElementRef;

  seats: any[] = [];
  filteredSeats: any[] = [];
  sections: Section[] = [];
  selectedSeat: any = null;
  selectedSectionId: string | null = null;
  showCreateForm = false;
  showCreateSectionForm = false;
  createSeatForm!: FormGroup;
  createSectionForm!: FormGroup;
  loading = false;
  hoveredSeat: SeatPosition | null = null;
  tooltipX = 0;
  tooltipY = 0;

  seatPositions: SeatPosition[] = [];
  sectionLabels: SectionLabel[] = [];

  mapWidth = 900;
  mapHeight = 650;
  stageWidth = 160;
  stageHeight = 60;
  stageX = 0;
  stageY = 0;

  private sectionColors = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981',
    '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
    '#f97316', '#06b6d4',
  ];

  levelOptions = [
    { label: 'Lower', value: 'lower' },
    { label: 'Middle', value: 'middle' },
    { label: 'Upper', value: 'upper' },
    { label: 'VIP', value: 'vip' },
  ];

  constructor(
    private seatService: SeatService,
    private sectionService: SectionService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadSeats();
    this.loadSections();
    this.initializeForm();
  }

  initializeForm(): void {
    this.createSeatForm = this.fb.group({
      seatNumber: [null, [Validators.required]],
      row: [null, [Validators.required]],
      sectionId: [null, [Validators.required]],
    });

    this.createSectionForm = this.fb.group({
      name: ['', [Validators.required]],
      level: ['lower', [Validators.required]],
      totalRows: [null, [Validators.required, Validators.min(1)]],
    });
  }

  loadSeats(): void {
    this.seatService.getSeatsByVenue(this.venueId).subscribe({
      next: (seats) => {
        this.seats = seats;
        this.applyFilter();
        this.buildArenaMap();
      },
      error: (err) => {
        console.error('Failed to load seats:', err);
      },
    });
  }

  loadSections(): void {
    this.sectionService.getSectionsByVenue(this.venueId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.buildArenaMap();
      },
      error: (err) => {
        console.error('Failed to load sections:', err);
      },
    });
  }

  buildArenaMap(): void {
    if (!this.sections.length || !this.seats.length) return;

    this.seatPositions = [];
    this.sectionLabels = [];

    switch (this.layout) {
      case 'full-circle':
        this.buildFullCircle();
        break;
      case 'rectangle':
        this.buildRectangle();
        break;
      case 'horseshoe':
        this.buildHorseshoe();
        break;
      default:
        this.buildSemicircle();
        break;
    }

    this.fitViewBox();
  }

  private fitViewBox(): void {
    if (this.seatPositions.length === 0) return;

    const padding = 30;
    let minX = this.stageX;
    let minY = this.stageY;
    let maxX = this.stageX + this.stageWidth;
    let maxY = this.stageY + this.stageHeight;

    for (const pos of this.seatPositions) {
      minX = Math.min(minX, pos.x - 8);
      minY = Math.min(minY, pos.y - 8);
      maxX = Math.max(maxX, pos.x + 8);
      maxY = Math.max(maxY, pos.y + 8);
    }

    for (const label of this.sectionLabels) {
      minX = Math.min(minX, label.x - 50);
      minY = Math.min(minY, label.y - 8);
      maxX = Math.max(maxX, label.x + 50);
      maxY = Math.max(maxY, label.y + 8);
    }

    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    this.stageX += offsetX;
    this.stageY += offsetY;

    for (const pos of this.seatPositions) {
      pos.x += offsetX;
      pos.y += offsetY;
    }

    for (const label of this.sectionLabels) {
      label.x += offsetX;
      label.y += offsetY;
    }

    this.mapWidth = Math.max(maxX - minX + padding * 2, 700);
    this.mapHeight = Math.max(maxY - minY + padding * 2, 500);
  }

  private getLevelRadius(level: string): number {
    const radii: Record<string, number> = {
      vip: 130,
      lower: 180,
      middle: 230,
      upper: 280,
    };
    return radii[level] || 180;
  }

  private getSectionSeats(sectionId: string): any[] {
    return this.seats.filter((s) => {
      const sid = s.sectionId?._id || s.sectionId;
      return sid === sectionId;
    });
  }

  private getRowMap(sectionSeats: any[]): Map<string, any[]> {
    const rowMap = new Map<string, any[]>();
    for (const seat of sectionSeats) {
      const row = seat.row?.toString() || '1';
      if (!rowMap.has(row)) rowMap.set(row, []);
      rowMap.get(row)!.push(seat);
    }
    return rowMap;
  }

  private getSortedRows(rowMap: Map<string, any[]>): string[] {
    return Array.from(rowMap.keys()).sort((a, b) => parseInt(a) - parseInt(b));
  }

  private getOrderedSections(): { section: Section; color: string }[] {
    const levelOrder = ['vip', 'lower', 'middle', 'upper'];
    const result: { section: Section; color: string }[] = [];
    let colorIdx = 0;

    for (const level of levelOrder) {
      for (const section of this.sections) {
        if ((section.level || 'lower') === level) {
          result.push({
            section,
            color: this.sectionColors[colorIdx % this.sectionColors.length],
          });
          colorIdx++;
        }
      }
    }
    return result;
  }

  private buildArcLayout(arcStart: number, arcEnd: number): void {
    this.stageX = -this.stageWidth / 2;
    this.stageY = -this.stageHeight / 2;

    const orderedSections = this.getOrderedSections();
    if (orderedSections.length === 0) return;

    const rowSpacing = 14;
    const levelOrder = ['vip', 'lower', 'middle', 'upper'];
    const levelGroups = new Map<string, { section: Section; color: string }[]>();

    for (const entry of orderedSections) {
      const level = entry.section.level || 'lower';
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(entry);
    }

    let nextMinRadius = 100;

    for (const level of levelOrder) {
      const group = levelGroups.get(level);
      if (!group || group.length === 0) continue;

      const baseRadius = Math.max(this.getLevelRadius(level), nextMinRadius);
      const gap = group.length > 1 ? 0.04 : 0;
      const totalGap = gap * (group.length - 1);
      const sectionArc = (arcEnd - arcStart - totalGap) / group.length;

      let maxRowsInLevel = 0;

      for (let i = 0; i < group.length; i++) {
        const { section, color } = group[i];
        const sectionStart = arcStart + i * (sectionArc + gap);

        const sectionSeats = this.getSectionSeats(section._id);
        const rowMap = this.getRowMap(sectionSeats);
        const rows = this.getSortedRows(rowMap);
        maxRowsInLevel = Math.max(maxRowsInLevel, rows.length);

        for (let r = 0; r < rows.length; r++) {
          const rowSeats = rowMap.get(rows[r])!.sort(
            (a: any, b: any) => parseInt(a.seatNumber) - parseInt(b.seatNumber)
          );
          const radius = baseRadius + r * rowSpacing;

          for (let s = 0; s < rowSeats.length; s++) {
            const t = rowSeats.length === 1 ? 0.5 : s / (rowSeats.length - 1);
            const angle = sectionStart + t * sectionArc;
            this.seatPositions.push({
              seat: rowSeats[s],
              x: radius * Math.cos(angle),
              y: radius * Math.sin(angle),
              sectionId: section._id,
              color,
            });
          }
        }

        const midAngle = sectionStart + sectionArc / 2;
        const labelR = baseRadius - 25;
        this.sectionLabels.push({
          x: labelR * Math.cos(midAngle),
          y: labelR * Math.sin(midAngle),
          name: section.name,
          sectionId: section._id,
        });
      }

      nextMinRadius = baseRadius + maxRowsInLevel * rowSpacing + 20;
    }
  }

  private buildSemicircle(): void {
    this.buildArcLayout(Math.PI * 0.1, Math.PI * 0.9);
  }

  private buildFullCircle(): void {
    this.buildArcLayout(0, Math.PI * 1.97);
  }

  private buildHorseshoe(): void {
    this.buildArcLayout(-Math.PI * 0.2, Math.PI * 1.2);
  }

  private buildRectangle(): void {
    this.stageX = -this.stageWidth / 2;
    this.stageY = -this.stageHeight / 2;

    const orderedSections = this.getOrderedSections();
    if (orderedSections.length === 0) return;

    const totalSections = orderedSections.length;
    const sideMargin = 70;
    const sideLength = 220;
    const sides: { dir: string; horizontal: boolean; fixedCoord: number; start: number; end: number; outward: number }[] = [
      { dir: 'bottom', horizontal: true,  fixedCoord: sideMargin,  start: -sideLength / 2, end: sideLength / 2, outward: 1 },
      { dir: 'left',   horizontal: false, fixedCoord: -sideMargin - 30, start: -sideLength / 2, end: sideLength / 2, outward: -1 },
      { dir: 'right',  horizontal: false, fixedCoord: sideMargin + 30, start: -sideLength / 2, end: sideLength / 2, outward: 1 },
      { dir: 'top',    horizontal: true,  fixedCoord: -sideMargin,  start: -sideLength / 2, end: sideLength / 2, outward: -1 },
    ];

    const sectionsPerSide = Math.ceil(totalSections / sides.length);
    const rowSpacing = 14;
    let sectionIdx = 0;

    for (const side of sides) {
      const sideSections: { section: Section; color: string }[] = [];
      for (let s = 0; s < sectionsPerSide && sectionIdx < totalSections; s++) {
        sideSections.push(orderedSections[sectionIdx++]);
      }
      if (sideSections.length === 0) continue;

      for (let si = 0; si < sideSections.length; si++) {
        const { section, color } = sideSections[si];
        const sectionSeats = this.getSectionSeats(section._id);
        const rowMap = this.getRowMap(sectionSeats);
        const rows = this.getSortedRows(rowMap);
        const levelOffset = 20;

        const totalSpan = side.end - side.start;
        const sectionSpan = totalSpan / sideSections.length;
        const sectionStart = side.start + si * sectionSpan;

        for (let r = 0; r < rows.length; r++) {
          const rowSeats = rowMap.get(rows[r])!.sort(
            (a: any, b: any) => parseInt(a.seatNumber) - parseInt(b.seatNumber)
          );
          const offset = side.fixedCoord + (levelOffset + r * rowSpacing) * side.outward;

          for (let s = 0; s < rowSeats.length; s++) {
            const t = rowSeats.length === 1 ? 0.5 : s / (rowSeats.length - 1);
            const along = sectionStart + 10 + t * (sectionSpan - 20);

            if (side.horizontal) {
              this.seatPositions.push({ seat: rowSeats[s], x: along, y: offset, sectionId: section._id, color });
            } else {
              this.seatPositions.push({ seat: rowSeats[s], x: offset, y: along, sectionId: section._id, color });
            }
          }
        }

        const labelOffset = side.fixedCoord + (levelOffset + Math.max(rows.length - 1, 0) * rowSpacing + 18) * side.outward;
        const labelAlong = sectionStart + sectionSpan / 2;

        if (side.horizontal) {
          this.sectionLabels.push({ x: labelAlong, y: labelOffset, name: section.name, sectionId: section._id });
        } else {
          this.sectionLabels.push({ x: labelOffset, y: labelAlong, name: section.name, sectionId: section._id });
        }
      }
    }
  }

  getSectionColor(sectionId: string): string {
    const pos = this.seatPositions.find((p) => p.sectionId === sectionId);
    return pos ? pos.color : '#6366f1';
  }

  isSeatDimmed(pos: SeatPosition): boolean {
    return !!this.selectedSectionId && pos.sectionId !== this.selectedSectionId;
  }

  isSeatSelected(pos: SeatPosition): boolean {
    return this.selectedSeat?._id === pos.seat._id;
  }

  onSeatHover(event: MouseEvent, pos: SeatPosition): void {
    this.hoveredSeat = pos;
    this.tooltipX = event.offsetX + 12;
    this.tooltipY = event.offsetY - 30;
  }

  onSeatLeave(): void {
    this.hoveredSeat = null;
  }

  filterBySection(sectionId: string | null): void {
    this.selectedSectionId = sectionId;
    this.applyFilter();
  }

  applyFilter(): void {
    if (!this.selectedSectionId) {
      this.filteredSeats = [...this.seats];
    } else {
      this.filteredSeats = this.seats.filter((seat) => {
        const seatSectionId = seat.sectionId?._id || seat.sectionId;
        return seatSectionId === this.selectedSectionId;
      });
    }
  }

  getSectionName(sectionId: string): string {
    const section = this.sections.find((s) => s._id === sectionId);
    return section ? section.name : '';
  }

  onCreateSeat(): void {
    this.createSeatForm.markAllAsTouched();
    if (!this.createSeatForm.valid) return;

    this.loading = true;
    const seatData = {
      ...this.createSeatForm.value,
      venueId: this.venueId,
    };

    this.seatService.createSeat(seatData).subscribe({
      next: (seat) => {
        this.seats.push(seat);
        this.applyFilter();
        this.buildArenaMap();
        this.createSeatForm.reset();
        this.showCreateForm = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create seat:', err);
        this.loading = false;
      },
    });
  }

  onCreateSection(): void {
    this.createSectionForm.markAllAsTouched();
    if (!this.createSectionForm.valid) return;

    this.loading = true;
    const sectionData = {
      ...this.createSectionForm.value,
      venueId: this.venueId,
    };

    this.sectionService.createSection(sectionData).subscribe({
      next: (section) => {
        this.sections.push(section);
        this.buildArenaMap();
        this.createSectionForm.reset({ level: 'lower' });
        this.showCreateSectionForm = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create section:', err);
        this.loading = false;
      },
    });
  }

  deleteSection(sectionId: string): void {
    if (confirm('Are you sure? All seats in this section will also be deleted.')) {
      this.sectionService.deleteSection(sectionId).subscribe({
        next: () => {
          this.sections = this.sections.filter((s) => s._id !== sectionId);
          if (this.selectedSectionId === sectionId) {
            this.selectedSectionId = null;
          }
          this.loadSeats();
        },
        error: (err) => {
          console.error('Failed to delete section:', err);
        },
      });
    }
  }

  deleteSeat(seatId: string): void {
    if (confirm('Are you sure you want to delete this seat?')) {
      this.seatService.deleteSeat(seatId).subscribe({
        next: () => {
          this.seats = this.seats.filter((s) => s._id !== seatId);
          this.applyFilter();
          this.buildArenaMap();
        },
        error: (err) => {
          console.error('Failed to delete seat:', err);
        },
      });
    }
  }

  selectSeat(seat: any): void {
    this.selectedSeat = seat;
    setTimeout(() => {
      if (this.seatDetailSection) {
        this.seatDetailSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}
