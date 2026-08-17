import { Form, Head } from '@inertiajs/react';
import { store } from '@/routes/login';
import { useT } from '@/lib/i18n';

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    const t = useT();
    return (
        <>
            <Head title="Log in" />

            <div
                className="relative flex min-h-svh flex-col items-center justify-center bg-[var(--paper)] p-6"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 12%, #ffe9c4 0%, transparent 45%)' }}
            >
                <div className="w-full max-w-sm rounded-2xl bg-[var(--surface)] p-8 shadow-[var(--shadow-sticker)]">
                    <div className="mb-7">
                        <h1 className="font-display text-2xl font-black text-[var(--ink)]">
                            {t('auth.login.title')}
                        </h1>
                        <p className="mt-1.5 font-body text-sm text-[var(--ink-soft)]">
                            {t('auth.login.subtitle')}
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-[12px] bg-[var(--paper-deep)] px-3 py-2 text-center font-body text-sm text-[var(--candy-deep)]">
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
                                        className="font-display text-xs font-extrabold text-[var(--ink-soft)]"
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
                                        className="rounded-[14px] bg-[var(--paper-deep)] px-4 py-3 font-body text-[15px] text-[var(--ink)] placeholder-[var(--ink-faint)]"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 font-body text-sm text-[var(--accent-frida)]">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="password"
                                        className="font-display text-xs font-extrabold text-[var(--ink-soft)]"
                                    >
                                        {t('auth.login.password')}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder={t('auth.login.password_placeholder')}
                                        className="rounded-[14px] bg-[var(--paper-deep)] px-4 py-3 font-body text-[15px] text-[var(--ink)] placeholder-[var(--ink-faint)]"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 font-body text-sm text-[var(--accent-frida)]">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-candy mt-2 w-full px-4 py-3 text-base disabled:opacity-50"
                                >
                                    {processing ? t('auth.login.loading') : t('auth.login.start')}
                                </button>
                            </>
                        )}
                    </Form>

                </div>
            </div>
        </>
    );
}
