import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Lock, Building, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import intelbrasLogo from '../../assets/intelbras-logo.svg';
import IntelbrasModal from '../ui/IntelbrasModal';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              department: department,
              position: position
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: user.id, 
              full_name: fullName, 
              department: department,
              position: position 
            }]);
          if (profileError) console.error('Error creating profile:', profileError);
        }
        
        setShowSuccessModal(true);
      }
    } catch (err) {
      if (err.message.includes('User already registered') || err.message.includes('identity already exists')) {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <img src={intelbrasLogo} alt="Intelbras" className="w-40 h-auto" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Full Name / Analista */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#bbcad2] group-focus-within:text-[#00a335] transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Analista"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#bbcad2] rounded-md leading-5 bg-white text-[#8b979f] placeholder-[#bbcad2] focus:outline-none focus:ring-1 focus:ring-[#00a335] focus:border-[#00a335] sm:text-sm transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-[#bbcad2] group-focus-within:text-[#00a335] transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Departamento"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#bbcad2] rounded-md leading-5 bg-white text-[#8b979f] placeholder-[#bbcad2] focus:outline-none focus:ring-1 focus:ring-[#00a335] focus:border-[#00a335] sm:text-sm transition-all"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              {/* Position / Cargo */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#bbcad2] group-focus-within:text-[#00a335] transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Cargo / Posição"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#bbcad2] rounded-md leading-5 bg-white text-[#8b979f] placeholder-[#bbcad2] focus:outline-none focus:ring-1 focus:ring-[#00a335] focus:border-[#00a335] sm:text-sm transition-all"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#bbcad2] group-focus-within:text-[#00a335] transition-colors" />
            </div>
            <input
              type="email"
              required
              placeholder={isLogin ? "Usuário" : "E-mail"}
              className="block w-full pl-10 pr-3 py-2.5 border border-[#bbcad2] rounded-md leading-5 bg-white text-[#8b979f] placeholder-[#bbcad2] focus:outline-none focus:ring-1 focus:ring-[#00a335] focus:border-[#00a335] sm:text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-[#bbcad2] group-focus-within:text-[#00a335] transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Senha"
              className="block w-full pl-10 pr-10 py-2.5 border border-[#bbcad2] rounded-md leading-5 bg-white text-[#8b979f] placeholder-[#bbcad2] focus:outline-none focus:ring-1 focus:ring-[#00a335] focus:border-[#00a335] sm:text-sm transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#bbcad2] hover:text-[#8b979f]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-xs mt-2 text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#00a335] hover:bg-[#008a2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a335] transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button 
            type="button"
            className="text-xs text-[#8b979f] opacity-50 cursor-not-allowed"
            title="Funcionalidade em desenvolvimento"
            disabled
          >
            Recuperar senha
          </button>
          
          <div className="h-[1px] w-full bg-[#bbcad2] opacity-30"></div>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] font-bold text-[#00a335] uppercase tracking-wider hover:underline"
          >
            {isLogin ? 'Criar nova conta' : 'Já tenho uma conta'}
          </button>
        </div>
      </div>

      <IntelbrasModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setShowSuccessModal(false);
          setIsLogin(true);
        }}
        title="Cadastro Realizado"
        message="Seu usuário foi cadastrado com sucesso. Você já pode fazer login no sistema e começar a criar seus relatórios."
        confirmText="Fazer Login"
      />
    </div>
  );
};

export default AuthScreen;
