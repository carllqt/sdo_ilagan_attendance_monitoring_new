<?php

namespace Database\Seeders;

use App\Models\Administrator\Employee;
use App\Models\Administrator\Office;
use App\Models\Administrator\Station;
use App\Models\Administrator\WorkSchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/sdoemployee.xlsx');

        if (! file_exists($path)) {
            Log::warning('EmployeeSeeder skipped because sdoemployee.xlsx was not found.', [
                'path' => $path,
            ]);

            return;
        }

        $rows = Excel::toArray([], $path)[0] ?? [];

        if ($rows === []) {
            return;
        }

        $headers = $this->headers($rows[0] ?? []);
        $officeIds = Office::query()->pluck('id', 'name');
        $defaultStationId = Station::query()->orderBy('id')->value('id');
        $defaultWorkScheduleId = WorkSchedule::query()->orderBy('id')->value('id');
        $profileImages = $this->profileImages();

        foreach ($rows as $index => $row) {
            if ($index === 0) {
                continue;
            }

            $lastName = $this->cell($row, $headers, 'last name');
            $firstName = $this->cell($row, $headers, 'first name');
            $middleName = $this->cell($row, $headers, 'middle name');
            $position = $this->cell($row, $headers, 'position');
            $unit = $this->cell($row, $headers, 'unit');

            if ($lastName === '' && $firstName === '' && $position === '') {
                continue;
            }

            if ($lastName === '' || $firstName === '' || $position === '') {
                Log::warning('Skipping invalid employee row.', [
                    'row' => $index + 1,
                    'data' => $row,
                ]);

                continue;
            }

            $officeId = $unit !== '' ? $officeIds->get($unit) : null;

            if ($unit !== '' && ! $officeId) {
                Log::warning('Employee row has no matching office.', [
                    'row' => $index + 1,
                    'unit' => $unit,
                ]);
            }

            Employee::updateOrCreate(
                [
                    'station_id' => $defaultStationId,
                    'first_name' => $firstName,
                    'middle_name' => $middleName !== '' ? $middleName : null,
                    'last_name' => $lastName,
                ],
                [
                    'position' => $position,
                    'office_id' => $officeId,
                    'work_schedule_id' => $defaultWorkScheduleId,
                    'unit' => $unit !== '' ? $unit : null,
                    'profile_img' => $this->profileImageFor($profileImages, $lastName, $firstName),
                    'active_status' => true,
                ],
            );
        }
    }

    private function headers(array $row): array
    {
        $headers = [];

        foreach ($row as $index => $value) {
            $key = strtolower(trim((string) $value));

            if ($key !== '') {
                $headers[$key] = $index;
            }
        }

        return $headers;
    }

    private function cell(array $row, array $headers, string $key): string
    {
        return trim((string) ($row[$headers[$key] ?? -1] ?? ''));
    }

    private function profileImages(): array
    {
        $directory = storage_path('app/public/employee-profile-images');

        if (! is_dir($directory)) {
            return [];
        }

        $images = [];
        $extensions = ['jpg', 'jpeg', 'png', 'webp'];

        foreach (scandir($directory) ?: [] as $file) {
            $path = $directory . DIRECTORY_SEPARATOR . $file;
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            if (! is_file($path) || ! in_array($extension, $extensions, true)) {
                continue;
            }

            $name = pathinfo($file, PATHINFO_FILENAME);
            $images[$this->normalizeName($name)] = 'employee-profile-images/' . $file;
        }

        return $images;
    }

    private function profileImageFor(array $profileImages, string $lastName, string $firstName): ?string
    {
        $firstInitial = mb_substr($firstName, 0, 1);
        $candidates = [
            "{$lastName}, {$firstName}",
            "{$lastName}, {$firstInitial}",
            $lastName,
        ];

        foreach ($candidates as $candidate) {
            $key = $this->normalizeName($candidate);

            if (isset($profileImages[$key])) {
                return $profileImages[$key];
            }
        }

        return null;
    }

    private function normalizeName(string $name): string
    {
        return mb_strtolower(preg_replace('/\s+/', ' ', trim($name)));
    }
}
