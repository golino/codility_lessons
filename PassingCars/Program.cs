using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PassingCars
{
	class Program
	{
		static void Main(string[] args)
		{
			int[] A = RandomInt(100000);//{ };// 0, 1, 0, 1, 1 };
			Console.WriteLine(solution(A));
			Console.ReadLine();
		}
		//https://codility.com/demo/results/trainingVERZSJ-VYV/
		public static int solution(int[] A)
		{
			if (A.Length > 1000000000 || A[0] > 100000)
				return -1;

			if (A.Length < 2 || A[0] == 1 || !A.Contains(0) || !A.Contains(1))
				return 0;

			int pairs = 0;
			List<int> westerns = new List<int>();
			List<int> easterns = new List<int>();

			for (int i = A.Length - 1; i > 0; i--)
			{
				if (A[i].Equals(1))
				{
					pairs++;
					westerns.Add(i);
				}
				else
				{
					easterns.Add(i);
				}

				if (A[i] > 100000)
					return -1;
			}

			easterns.Reverse();
			westerns.Reverse();

			for (int i = 0; i < easterns.Count; i++)
			{
				if (westerns.Count > 0)
				{
					while (westerns.Count > 0 && westerns[0] < easterns[i])
						westerns.RemoveAt(0);

					pairs += westerns.Count;

					if (pairs > 1000000000)
						return - 1;
				}
			}

			return pairs;
		}
		public static int solution2(int[] A)
		{
			List<int> eastCars = new List<int>();
			List<int> westCars = new List<int>();
			List<int[]> pairs = new List<int[]>();

			for (int i = 0; i < A.Length; i++)
			{
				if (A[i] == 0)
					eastCars.Add(i);
				else
					westCars.Add(i);
			}

			if (A[0] == 0)
			{
				for (int i = 0; i < eastCars.Count; i++)
				{
					westCars.FindAll(p => p > eastCars[i]).ForEach(w => pairs.Add(new int[] { eastCars[i], w }));
				}
			}
			else
			{
				for (int i = 0; i < westCars.Count; i++)
				{
					eastCars.FindAll(p => p > westCars[i]).ForEach(w => pairs.Add(new int[] { westCars[i], w }));
				}
			}

			if (pairs.Count > 1000000000)
				return -1;
			else
				return pairs.Count;
		}
		public static int[] RandomInt(int qtd)
		{
			Random r = new Random(1);
			int[] arr = new int[qtd];

			for (int i = 0; i < qtd; i++)
			{
				arr[i] = r.Next(0, 100000) % 2 == 0 ? 0 : 1;
			}

			return arr;
		}
	}
}
