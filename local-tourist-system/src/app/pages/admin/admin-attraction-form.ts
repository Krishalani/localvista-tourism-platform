import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AttractionService } from '../../core/attraction.service';
import { ApiProblem, AttractionSave, Category } from '../../core/models';

/** Rejects values that are empty or only spaces, matching the server-side rule. */
function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

@Component({
  selector: 'app-admin-attraction-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-attraction-form.html',
})
export class AdminAttractionForm implements OnInit {
  private readonly api = inject(AttractionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  /** Route parameter; absent on the "new attraction" page. */
  readonly id = input(undefined, { transform: (value: unknown) => (value == null ? undefined : numberAttribute(value)) });
  protected readonly isEdit = computed(() => this.id() !== undefined);

  protected readonly categories = toSignal(
    this.api.getCategories().pipe(catchError(() => of<Category[]>([]))),
    { initialValue: [] as Category[] },
  );

  protected readonly form = this.fb.group({
    name: this.fb.control('', [notBlank, Validators.maxLength(150)]),
    categoryId: this.fb.control<number | null>(null, Validators.required),
    description: this.fb.control('', [notBlank, Validators.maxLength(2000)]),
    openingHours: this.fb.control('', [Validators.maxLength(200)]),
    travelTips: this.fb.control('', [Validators.maxLength(1000)]),
    // BR-02: only attractions within approximately 25 km of Kandy.
    distanceFromKandyKm: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(25)]),
    imageUrl: this.fb.control('', [Validators.maxLength(500)]),
    latitude: this.fb.control<number | null>(null, [Validators.min(-90), Validators.max(90)]),
    longitude: this.fb.control<number | null>(null, [Validators.min(-180), Validators.max(180)]),
  });

  protected readonly loadState = signal<'loading' | 'ready' | 'not-found' | 'error'>('ready');
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');
  protected readonly serverErrors = signal<string[]>([]);

  ngOnInit(): void {
    const id = this.id();
    if (id === undefined) {
      return;
    }

    this.loadState.set('loading');
    this.api.getById(id).subscribe({
      next: (attraction) => {
        this.form.patchValue({
          ...attraction,
          openingHours: attraction.openingHours ?? '',
          travelTips: attraction.travelTips ?? '',
          imageUrl: attraction.imageUrl ?? '',
        });
        this.loadState.set('ready');
      },
      error: (response: HttpErrorResponse) =>
        this.loadState.set(response.status === 404 ? 'not-found' : 'error'),
    });
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected save(): void {
    this.submitted.set(true);
    this.error.set('');
    this.serverErrors.set([]);

    // FR-18: the record is not saved while a mandatory field is missing.
    if (this.form.invalid) {
      this.error.set('Please correct the highlighted fields before saving.');
      return;
    }

    const value = this.form.getRawValue();
    const attraction: AttractionSave = {
      name: value.name.trim(),
      categoryId: value.categoryId!,
      description: value.description.trim(),
      openingHours: value.openingHours.trim() || null,
      travelTips: value.travelTips.trim() || null,
      distanceFromKandyKm: value.distanceFromKandyKm,
      imageUrl: value.imageUrl.trim() || null,
      latitude: value.latitude,
      longitude: value.longitude,
    };

    const id = this.id();
    const request = id === undefined ? this.api.create(attraction) : this.api.update(id, attraction);

    this.saving.set(true);
    request.subscribe({
      next: (saved) =>
        this.router.navigate(['/admin/attractions'], {
          state: { notice: `"${saved.name}" was ${id === undefined ? 'added' : 'updated'}.` },
        }),
      error: (response: HttpErrorResponse) => {
        this.saving.set(false);
        const problem = response.error as ApiProblem | null;
        if (response.status === 400 && problem?.errors) {
          this.error.set('The server rejected the record:');
          this.serverErrors.set(Object.values(problem.errors).flat());
        } else if (response.status === 404) {
          this.error.set('This attraction no longer exists.');
        } else if (response.status !== 401) {
          this.error.set('The attraction could not be saved. Please try again.');
        }
      },
    });
  }
}
