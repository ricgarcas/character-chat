import { Form, Head, Link } from '@inertiajs/react';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useT } from '@/lib/i18n';
import { LocaleToggle } from '@/components/locale-toggle';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const t = useT();
    return (
        <>
            <Head title="> LOG IN" />

            <LocaleToggle fixed />

            <div className="bg-paper relative flex min-h-svh flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="mb-8 text-center">
                        <h1
                            className="font-display text-xl uppercase tracking-tight text-[var(--ink)]"
                            style={{ textShadow: '3px 3px 0 var(--pixel-shadow)' }}
                        >
                            {t('auth.login.title')}
                        </h1>
                        <p className="mt-3 font-body text-base text-[var(--ink-light)]">
                            {t('auth.login.subtitle')}
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 border-2 border-[var(--accent-dali)] bg-[var(--bg-deep)] px-3 py-2 text-center font-body text-sm text-[var(--accent-dali)]">
                            {status}
                        </div>
                    )}

                    <Form
                        action={store()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input type="hidden" name="remember" value="1" />

                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="email"
                                        className="font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)]"
                                    >
                                        {t('auth.login.email')}
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder={t('auth.login.email_placeholder')}
                                        className="input-sketch px-3 py-2 font-body text-base"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 font-body text-sm text-[var(--accent-frida)]">
                                            ▌ {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="font-display text-[10px] uppercase tracking-widest text-[var(--ink-faint)]"
                                        >
                                            {t('auth.login.password')}
                                        </label>
                                        {canResetPassword && (
                                            <a
                                                href={request().url}
                                                className="font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
                                            >
                                                {t('auth.login.forgot')}
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder={t('auth.login.password_placeholder')}
                                        className="input-sketch px-3 py-2 font-body text-base"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 font-body text-sm text-[var(--accent-frida)]">
                                            ▌ {errors.password}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-sketch mt-2 px-4 py-3 disabled:opacity-50"
                                    style={{
                                        backgroundColor: 'var(--accent-dali)',
                                        color: 'var(--bg)',
                                    }}
                                >
                                    {processing ? t('auth.login.loading') : t('auth.login.start')}
                                </button>
                            </>
                        )}
                    </Form>

                    <p className="mt-8 text-center font-display text-[9px] uppercase tracking-widest text-[var(--ink-faint)]">
                        {t('auth.login.no_account')}{' '}
                        <Link
                            href="/register"
                            className="text-[var(--ink)] underline-offset-2 hover:underline"
                        >
                            {t('auth.login.sign_up')}
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
