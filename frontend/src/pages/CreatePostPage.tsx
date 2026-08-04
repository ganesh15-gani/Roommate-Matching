import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { completeProfileSchema, type CompleteProfileFormData } from '../lib/validations';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Building2, Home, ArrowRight, ArrowLeft, User, Briefcase, MapPin, Search, Users, Coffee, Cigarette, Moon, DollarSign } from 'lucide-react';

const steps = [
  { id: 'Basic', title: 'Personal Details' },
  { id: 'Stay', title: 'Listing Details' },
  { id: 'Lifestyle', title: 'Preferences & Location' },
  { id: 'Bio', title: 'Description & Finish' }
];

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth(); 

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onTouched',
    defaultValues: user?.profileCompleted ? user : {}
  });

  const stayType = watch("stayType");



  const nextStep = async () => {
    const fieldsToValidate: any = {
      0: ['fullName', 'gender', 'age', 'occupation', 'companyOrCollege'],
      1: ['stayType', 'sharingType', 'flatType', 'lookingFor', 'preferredGender'],
      2: ['smoking', 'drinking', 'foodPreference', 'sleepingHabit', 'minBudget', 'maxBudget', 'area'],
      3: ['bio']
    };

    const isStepValid = await trigger(fieldsToValidate[currentStep]);
    if (isStepValid) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: CompleteProfileFormData) => {
    setLoading(true);
    try {
      await api.post('/posts', data);
      
      const storedToken = localStorage.getItem('stayzen_v2_token');
      // If we need to update user context with profileCompleted
      if (user) {
        login({ ...user, profileCompleted: true, token: storedToken || undefined });
      }
      
      toast.success('Listing created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", options, icon: Icon }: any) => (
    <div className="mb-4 w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />}
        {options ? (
          <select
            {...register(name)}
            className={`w-full p-3.5 ${Icon ? 'pl-11' : 'pl-3.5'} bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all text-slate-900 appearance-none cursor-pointer`}
          >
            <option value="">Select...</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            {...register(name)}
            type={type}
            className={`w-full p-3.5 ${Icon ? 'pl-11' : 'pl-3.5'} bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400`}
            placeholder={label}
          />
        )}
      </div>
      {errors[name as keyof CompleteProfileFormData] && (
        <p className="text-red-500 text-xs mt-1.5 font-medium">{errors[name as keyof CompleteProfileFormData]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Image Section */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-16">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/auth-bg.jpg)' }}></div>
        <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
        
        <div className="relative z-10 max-w-lg mt-auto pb-12">
          {/* Logo Glass Card */}
          <div className="w-32 h-32 rounded-3xl glass flex flex-col items-center justify-center mb-16 shadow-2xl backdrop-blur-md border border-white/20">
            <span className="text-[#10b981] font-bold text-4xl leading-none">S</span>
            <span className="text-slate-900 font-bold text-lg leading-tight mt-1">Stay<span className="text-[#10b981]">zen</span></span>
          </div>

          <h1 className="text-white text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Create Your<br />Listing.
          </h1>
          <p className="text-gray-100 text-xl font-light leading-relaxed max-w-md">
            Tell others exactly what you're looking for to find the perfect roommate.
          </p>
          
          <div className="space-y-6 mt-12">
            {steps.map((step, idx) => (
              <div key={step.id} className={`flex items-center gap-4 transition-all duration-300 ${idx === currentStep ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${idx === currentStep ? 'bg-white text-slate-900' : 'border border-white/30 text-white'}`}>
                  {idx + 1}
                </div>
                <span className="font-medium text-white">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-[500px] bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] my-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Almost there!</h2>
            <p className="text-slate-500 text-sm">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* STEP 1: Personal Details */}
                {currentStep === 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Full Name" name="fullName" icon={User} />
                      <InputField label="Gender" name="gender" options={["Male", "Female", "Other"]} icon={User} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Age" name="age" type="number" icon={User} />
                      <InputField label="Occupation" name="occupation" options={["Student", "Employee", "Business", "Freelancer"]} icon={Briefcase} />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <InputField label="Company / College" name="companyOrCollege" icon={Building2} />
                    </div>
                  </div>
                )}

                {/* STEP 2: Stay Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="w-full">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stay Type</label>
                        <div className="flex gap-4 h-[50px]">
                          <label className={`flex-1 border rounded-xl p-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${stayType === 'PG' ? 'border-[#003366] bg-blue-50 text-[#003366] shadow-sm ring-1 ring-[#003366]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                            <input type="radio" value="PG" {...register("stayType")} className="sr-only" />
                            <Building2 className="w-5 h-5" />
                            <span className="font-semibold text-sm">PG</span>
                          </label>
                          <label className={`flex-1 border rounded-xl p-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${stayType === 'Flat' ? 'border-[#003366] bg-blue-50 text-[#003366] shadow-sm ring-1 ring-[#003366]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                            <input type="radio" value="Flat" {...register("stayType")} className="sr-only" />
                            <Home className="w-5 h-5" />
                            <span className="font-semibold text-sm">Flat</span>
                          </label>
                          <label className={`flex-1 border rounded-xl p-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${stayType === 'Hotel' ? 'border-[#003366] bg-blue-50 text-[#003366] shadow-sm ring-1 ring-[#003366]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                            <input type="radio" value="Hotel" {...register("stayType")} className="sr-only" />
                            <Building2 className="w-5 h-5" />
                            <span className="font-semibold text-sm">Hotel</span>
                          </label>
                        </div>
                        {errors.stayType && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.stayType.message}</p>}
                      </div>
                      
                      <div className="w-full h-full flex items-end">
                        {stayType === 'PG' && (
                          <InputField label="Sharing Type" name="sharingType" options={["1-shared", "2-shared", "3-shared", "4-shared"]} />
                        )}
                        {stayType === 'Flat' && (
                          <InputField label="Flat Type" name="flatType" options={["1 BHK", "2 BHK", "3 BHK", "Villa", "Studio Apartment"]} />
                        )}
                        {!stayType && (
                          <div className="w-full p-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-400 text-sm flex items-center justify-center">
                            Select a stay type first
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <InputField label="Looking For" name="lookingFor" options={["Roommate", "Room", "Both"]} icon={Search} />
                      <InputField label="Preferred Gender" name="preferredGender" options={["Male", "Female", "Any"]} icon={Users} />
                    </div>
                  </div>
                )}

                {/* STEP 3: Lifestyle & Location */}
                {currentStep === 2 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Smoking" name="smoking" options={["Yes", "No"]} icon={Cigarette} />
                      <InputField label="Drinking" name="drinking" options={["Yes", "No"]} icon={Coffee} />
                      <InputField label="Food Pref." name="foodPreference" options={["Veg", "Non Veg", "Both"]} icon={Coffee} />
                      <InputField label="Sleeping Habit" name="sleepingHabit" options={["Early Sleeper", "Night Owl"]} icon={Moon} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Min Budget" name="minBudget" type="number" icon={DollarSign} />
                      <InputField label="Max Budget" name="maxBudget" type="number" icon={DollarSign} />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <InputField label="Area" name="area" icon={MapPin} />
                    </div>
                  </div>
                )}

                {/* STEP 4: Bio & Finish */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="w-full">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Listing Description</label>
                      <textarea
                        {...register("bio")}
                        rows={5}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-none"
                        placeholder="Describe your requirements, the place, or anything else potential roommates should know... (Max 300 chars)"
                        maxLength={300}
                      />
                      {errors.bio && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.bio.message}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-between">
              {currentStep > 0 ? (
                <button type="button" onClick={prevStep} className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors font-semibold rounded-xl text-sm">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div /> // Placeholder
              )}
              
              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={nextStep} className="flex items-center justify-center gap-2 px-8 py-3 bg-[#002B5E] hover:bg-[#001c3d] text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all font-semibold text-sm">
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 px-8 py-3 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl shadow-lg shadow-green-900/20 transition-all font-semibold text-sm disabled:opacity-70">
                  {loading ? 'Saving...' : 'Finish Setup'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
