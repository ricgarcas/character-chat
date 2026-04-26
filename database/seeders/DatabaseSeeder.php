<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'ricgarcas@gmail.com'],
            [
                'name' => 'Ricardo',
                'password' => bcrypt('rea2xvf_pgp_cxb3DQX'),
            ],
        );

        $this->call([
            CharacterSeeder::class,
        ]);
    }
}
